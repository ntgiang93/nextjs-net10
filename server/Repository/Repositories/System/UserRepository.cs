using System.Text;
using Dapper;
using SqlKata;
using Model.DTOs.System.User;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using Repository.Interfaces.Base;
using Common.Extensions;

namespace Repository.Repositories.System;

public class UserRepository : GenericRepository<User, string>, IUserRepository
{
    private readonly StringBuilder _sqlBuilder;
    private readonly string _tableName;
    private readonly string _userRoleTable;
    private readonly string _roleTalbe;

    public UserRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
        _tableName = StringHelper.GetTableName<User>();
        _userRoleTable = StringHelper.GetTableName<UserRole>();
        _roleTalbe = StringHelper.GetTableName<Role>();
    }

    public async Task<List<string>> GetRolesAsync(string userId)
    {
        var query = new Query($"{_tableName} as u")
            .Join($"{_userRoleTable} as ur", $"u.{nameof(User.Id)}", $"ur.{nameof(UserRole.UserId)}")
            .Join($"{_roleTalbe} as r", $"ur.{nameof(UserRole.RoleId)}", $"r.{nameof(Role.Id)}")
            .Where($"u.{nameof(User.Id)}", userId)
            .Where($"u.{nameof(User.IsDeleted)}", false)
            .Where($"u.{nameof(User.IsActive)}", true)
            .Where($"r.{nameof(Role.IsDeleted)}", false)
            .Select($"r.{nameof(Role.Code)}");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryAsync<string>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result.ToList();
    }
    
    public async Task<UserDto?> GetDetailAsync(string userId)
    {
        // Get user details
        var userQuery = new Query($"{nameof(User)}s")
            .Where(nameof(User.Id), userId)
            .Where(nameof(User.IsDeleted), false)
            .Where(nameof(User.IsActive), true);

        var userSql = _compiler.Compile(userQuery);
        
        using var connection = _connection;
        connection.Open();
        var user = await connection.QueryFirstOrDefaultAsync<User>(userSql.Sql, userSql.NamedBindings);
        
        if (user == null) return null;

        // Get user roles
        var roleQuery = new Query($"{_userRoleTable} as ur")
            .Join($"{_roleTalbe} as r", $"ur.{nameof(UserRole.RoleId)}", $"r.{nameof(Role.Id)}")
            .Where($"ur.{nameof(UserRole.UserId)}", user.Id)
            .Where($"r.{nameof(Role.IsDeleted)}", false)
            .Select($"r.{nameof(Role.Name)}", $"r.{nameof(Role.Id)}");

        var roleSql = _compiler.Compile(roleQuery);
        var roleData = await connection.QueryAsync<(string Name, long Id)>(roleSql.Sql, roleSql.NamedBindings);
        
        var roles = roleData.Select(r => r.Name).ToList();
        var roleIds = roleData.Select(r => r.Id.ToString()).ToList();

        return new UserDto
        {
            Id = user.Id.ToString(),
            Username = user.Username,
            Avatar = user.Avatar,
            Email = user.Email,
            Phone = user.Phone,
            FullName = user.FullName,
            IsActive = user.IsActive,
            TwoFa = user.TwoFa,
            isLocked = user.IsLocked,
            LockExprires = user.LockExprires,
            Roles = roles,
            RoleIds = roleIds
        };
    }

    public async Task<User?> FindLastUserByUsernamePrefixAsync(string prefix)
    {
        if (string.IsNullOrEmpty(prefix)) return null;
        
        var sql = BuildSelectQuery(_sqlBuilder, $"{nameof(User)}s", 
            $"{nameof(User.IsDeleted)} = 0 AND {nameof(User.IsActive)} = 1 AND {nameof(User.Username)} LIKE @prefix AND LEN({nameof(User.Username)}) = @expectedLength",
            $"{nameof(User.Username)} DESC");

        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryFirstOrDefaultAsync<User>(sql, new 
        { 
            prefix = prefix + "%", 
            expectedLength = prefix.Length + 3 
        });
        
        return result;
    }

    public async Task<(List<UserTableDto> Items, int TotalCount)> GetPaginatedUsersAsync(UserTableRequestDto request)
    {
        var parameters = new DynamicParameters();
        var whereConditions = new List<string> { $"u.{nameof(User.IsDeleted)} = 0" };

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            whereConditions.Add($"(LOWER(u.{nameof(User.Username)}) LIKE @searchTerm OR LOWER(u.{nameof(User.Email)}) LIKE @searchTerm OR LOWER(u.{nameof(User.FullName)}) LIKE @searchTerm)");
            parameters.Add("searchTerm", $"%{request.SearchTerm.ToLower()}%");
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            whereConditions.Add($"u.{nameof(User.IsActive)} = @isActive");
            parameters.Add("isActive", request.IsActive.Value);
        }

        // Filter by locked status
        if (request.isLocked.HasValue)
        {
            if (request.isLocked.Value)
                whereConditions.Add($"u.{nameof(User.LockExprires)} IS NOT NULL");
            else
                whereConditions.Add($"u.{nameof(User.LockExprires)} IS NULL");
        }

        var whereClause = string.Join(" AND ", whereConditions);

        // Build base query with role filtering if needed
        _sqlBuilder.Clear();
        if (!string.IsNullOrWhiteSpace(request.Roles))
        {
            _sqlBuilder.Append($@"
                SELECT DISTINCT u.{nameof(User.Id)}, u.{nameof(User.Username)}, u.{nameof(User.Email)}, u.{nameof(User.FullName)}, u.{nameof(User.Phone)}, u.{nameof(User.Avatar)}, u.{nameof(User.IsActive)}, u.{nameof(User.IsLocked)}
                FROM {_tableName}s u
                INNER JOIN {_userRoleTable} ur ON u.{nameof(User.Id)} = ur.{nameof(UserRole.UserId)}
                INNER JOIN {_roleTalbe} r ON ur.{nameof(UserRole.RoleId)} = r.{nameof(Role.Id)}
                WHERE ").Append(whereClause).Append($" AND r.{nameof(Role.IsDeleted)} = 0 AND r.{nameof(Role.Id)} IN @roleIds");
            
            var roleIdsList = request.Roles.Split(',').Select(long.Parse).ToList();
            parameters.Add("roleIds", roleIdsList);
        }
        else
        {
            _sqlBuilder.Append($"SELECT u.{nameof(User.Id)}, u.{nameof(User.Username)}, u.{nameof(User.Email)}, u.{nameof(User.FullName)}, u.{nameof(User.Phone)}, u.{nameof(User.Avatar)}, u.{nameof(User.IsActive)}, u.{nameof(User.IsLocked)} FROM {nameof(User)}s u WHERE ").Append(whereClause);
        }

        var baseQuery = _sqlBuilder.ToString();

        using var connection = _connection;
        connection.Open();
        
        // Get total count
        var countQuery = BuildCountQuery(_sqlBuilder, !string.IsNullOrWhiteSpace(request.Roles) 
            ? $"({baseQuery.Replace($"SELECT DISTINCT u.{nameof(User.Id)}, u.{nameof(User.Username)}, u.{nameof(User.Email)}, u.{nameof(User.FullName)}, u.{nameof(User.Phone)}, u.{nameof(User.Avatar)}, u.{nameof(User.IsActive)}, u.{nameof(User.IsLocked)}", $"SELECT DISTINCT u.{nameof(User.Id)}")})" 
            : $"{nameof(User)}s u", whereClause);
            
        var totalCount = await connection.QuerySingleAsync<int>(countQuery, parameters);

        // Get paginated results
        var paginatedQuery = BuildPaginationQuery(_sqlBuilder, baseQuery + $" ORDER BY u.{nameof(User.Username)}", request.Page, request.PageSize);
        var users = await connection.QueryAsync<UserTableDto>(paginatedQuery, parameters);

        // Get roles for users
        var userIds = users.Select(u => long.Parse(u.Id)).ToList();
        if (userIds.Any())
        {
            var roleQuery = $@"
                SELECT ur.{nameof(UserRole.UserId)}, r.{nameof(Role.Name)} as Role
                FROM {nameof(UserRole)} ur
                INNER JOIN {nameof(Role)}s r ON ur.{nameof(UserRole.RoleId)} = r.{nameof(Role.Id)}
                WHERE ur.{nameof(UserRole.UserId)} IN @userIds AND r.{nameof(Role.IsDeleted)} = 0";

            var userRoles = await connection.QueryAsync<(long UserId, string Role)>(roleQuery, new { userIds });
            var userRolesMap = userRoles.GroupBy(ur => ur.UserId).ToDictionary(g => g.Key, g => g.Select(ur => ur.Role).ToList());

            // Assign roles to users
            foreach (var user in users)
            {
                user.Roles = userRolesMap.TryGetValue(long.Parse(user.Id), out var roles) ? roles : new List<string>();
            }
        }

        return (users.ToList(), totalCount);
    }
    
    public async Task<(List<UserSelectDto> Items, int TotalCount)> GetPaginatedUser2SelectAsync(PaginationRequest request)
    {
        var parameters = new DynamicParameters();
        var whereConditions = new List<string> { $"{nameof(User.IsDeleted)} = 0", $"{nameof(User.IsActive)} = 1" };

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            whereConditions.Add($"(LOWER({nameof(User.Username)}) LIKE @searchTerm OR LOWER({nameof(User.Email)}) LIKE @searchTerm OR LOWER({nameof(User.FullName)}) LIKE @searchTerm)");
            parameters.Add("searchTerm", $"%{request.SearchTerm.ToLower()}%");
        }

        var whereClause = string.Join(" AND ", whereConditions);

        // Get total count
        var countQuery = BuildCountQuery(_sqlBuilder, $"{nameof(User)}s", whereClause);
        
        using var connection = _connection;
        connection.Open();
        var totalCount = await connection.QuerySingleAsync<int>(countQuery, parameters);

        // Get paginated results
        var selectQuery = BuildSelectQuery(_sqlBuilder, $"{nameof(User)}s", whereClause, nameof(User.Username));
        var paginatedQuery = BuildPaginationQuery(_sqlBuilder, selectQuery, request.Page, request.PageSize);
        
        var users = await connection.QueryAsync<User>(paginatedQuery, parameters);

        var result = users.Select(user => new UserSelectDto
        {
            Id = user.Id.ToString(),
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Avatar = user.Avatar,
        }).ToList();

        return (result, totalCount);
    }

    // Helper methods for building queries
    private string BuildSelectQuery(StringBuilder sqlBuilder, string tableName, string whereClause, string orderBy)
    {
        sqlBuilder.Clear();
        sqlBuilder.Append($"SELECT * FROM {tableName}");
        if (!string.IsNullOrEmpty(whereClause))
            sqlBuilder.Append($" WHERE {whereClause}");
        if (!string.IsNullOrEmpty(orderBy))
            sqlBuilder.Append($" ORDER BY {orderBy}");
        return sqlBuilder.ToString();
    }

    private string BuildCountQuery(StringBuilder sqlBuilder, string tableName, string whereClause)
    {
        sqlBuilder.Clear();
        sqlBuilder.Append($"SELECT COUNT(*) FROM {tableName}");
        if (!string.IsNullOrEmpty(whereClause))
            sqlBuilder.Append($" WHERE {whereClause}");
        return sqlBuilder.ToString();
    }

    private string BuildPaginationQuery(StringBuilder sqlBuilder, string baseQuery, int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        return $"{baseQuery} OFFSET {offset} ROWS FETCH NEXT {pageSize} ROWS ONLY";
    }
}