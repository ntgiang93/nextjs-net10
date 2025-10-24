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
using Model.DTOs.System;
using Model.DTOs.System.Role;

namespace Repository.Repositories.System;

public class UserRepository : GenericRepository<User, string>, IUserRepository
{
    private readonly string _tableName;
    private readonly string _userRoleTable;
    private readonly string _roleTalbe;

    public UserRepository(IDbConnectionFactory factory) : base(factory)
    {
        _tableName = StringHelper.GetTableName<User>();
        _userRoleTable = StringHelper.GetTableName<UserRole>();
        _roleTalbe = StringHelper.GetTableName<Role>();
    }

    public async Task<List<RoleClaimDto>> GetRolesAsync(string userId)
    {
        var query = new Query($"{_tableName} as u")
            .Join($"{_userRoleTable} as ur", $"u.{nameof(User.Id)}", $"ur.{nameof(UserRole.UserId)}")
            .Join($"{_roleTalbe} as r", $"ur.{nameof(UserRole.RoleId)}", $"r.{nameof(Role.Id)}")
            .Where($"u.{nameof(User.Id)}", userId)
            .Where($"u.{nameof(User.IsDeleted)}", false)
            .Where($"u.{nameof(User.IsActive)}", true)
            .Where($"r.{nameof(Role.IsDeleted)}", false)
            .Select([$"r.{nameof(Role.Code)}", $"r.{nameof(Role.Id)}"]);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<RoleClaimDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result.ToList();
    }
    
    public async Task<UserDto?> GetDetailAsync(string userId)
    {
        // Get user details
        var userQuery = new Query($"{nameof(User)}s")
            .Where(nameof(User.Id), userId)
            .Where(nameof(User.IsDeleted), false);

        var userSql = _compiler.Compile(userQuery);
        using var connection = _dbFactory.Connection;
        var user = await connection.QueryFirstOrDefaultAsync<User>(userSql.Sql, userSql.NamedBindings);
        
        if (user == null) return null;

        // Get user roles
        var roleQuery = new Query($"{_userRoleTable} as ur")
            .Join($"{_roleTalbe} as r", $"ur.{nameof(UserRole.RoleId)}", $"r.{nameof(Role.Id)}")
            .Where($"ur.{nameof(UserRole.UserId)}", user.Id)
            .Where($"r.{nameof(Role.IsDeleted)}", false)
            .Select($"r.{nameof(Role.Name)}", $"r.{nameof(Role.Id)}");

        var roleSql = _compiler.Compile(roleQuery);
        var roleData = await connection.QueryAsync<(string Name, int Id)>(roleSql.Sql, roleSql.NamedBindings);

        return new UserDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Avatar = user.Avatar,
            Email = user.Email,
            Phone = user.Phone,
            FullName = user.FullName,
            IsActive = user.IsActive,
            TwoFa = user.TwoFa,
            isLocked = user.IsLocked,
            LockExprires = user.LockExprires,
            Roles = roleData.Select(r => r.Id).ToList(),
            RolesName = roleData.Select(r => r.Name).ToList()
        };
    }

    public async Task<User?> FindLastUserByUserNamePrefixAsync(string prefix)
    {
        if (string.IsNullOrEmpty(prefix)) return null;
        
        var query = new Query($"{_tableName}")
            .Where(nameof(User.IsDeleted), false)
            .Where(nameof(User.IsActive), true)
            .WhereRaw($"{nameof(User.UserName)} LIKE ?", prefix + "%")
            .WhereRaw($"LEN({nameof(User.UserName)}) = ?", prefix.Length + 3)
            .OrderByDesc(nameof(User.UserName))
            .Limit(1);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<User>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result;
    }

    public async Task<(List<UserTableDto> Items, int TotalCount)> GetPaginatedUsersAsync(UserTableRequestDto request)
    {
        Query query;
        query = new Query($"{_tableName} as u")
                .LeftJoin($"{_userRoleTable} as ur", $"u.{nameof(User.Id)}", $"ur.{nameof(UserRole.UserId)}")
                .LeftJoin($"{_roleTalbe} as r", j => j
                    .On($"ur.{nameof(UserRole.RoleId)}", $"r.{nameof(Role.Id)}")
                    .Where($"r.{nameof(Role.IsDeleted)}", false))
                .Where($"u.{nameof(User.IsDeleted)}", false);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query.Where(q => q
                .WhereLike($"u.{nameof(User.UserName)}", $"{request.SearchTerm}")
                .OrWhereLike($"u.{nameof(User.Email)}", $"{request.SearchTerm}")
                .OrWhereLike($"u.{nameof(User.FullName)}", $"{request.SearchTerm}"));
        }

        // Filter by active status
        if (request.IsActive.HasValue)
        {
            query.Where($"u.{nameof(User.IsActive)}", request.IsActive.Value);
        }

        // Filter by locked status
        if (request.isLocked.HasValue)
        {
            if (request.isLocked.Value)
                query.WhereNotNull($"u.{nameof(User.LockExprires)}");
            else
                query.WhereNull($"u.{nameof(User.LockExprires)}");
        }

        // Select with string aggregation for roles
        query.Select([
            $"u.{nameof(User.Id)}",
            $"u.{nameof(User.UserName)}",
            $"u.{nameof(User.Email)}",
            $"u.{nameof(User.FullName)}",
            $"u.{nameof(User.Phone)}",
            $"u.{nameof(User.Avatar)}",
            $"u.{nameof(User.IsActive)}",
            $"u.{nameof(User.IsLocked)}"
        ])
        .SelectRaw($"STRING_AGG(r.{nameof(Role.Name)}, ' - ') as RolesString")
        .GroupBy([
            $"u.{nameof(User.Id)}",
            $"u.{nameof(User.UserName)}",
            $"u.{nameof(User.Email)}",
            $"u.{nameof(User.FullName)}",
            $"u.{nameof(User.Phone)}",
            $"u.{nameof(User.Avatar)}",
            $"u.{nameof(User.IsActive)}",
            $"u.{nameof(User.IsLocked)}"
        ]);
        // Count number user
        using var connection = _dbFactory.Connection;
        var countQuery = query.Clone().AsCount([$"u.{nameof(User.Id)}"]);
        var compiledCountQuery = _compiler.Compile(countQuery);
        var total = await connection.QuerySingleAsync<int>(compiledCountQuery.Sql, compiledCountQuery.NamedBindings);

        // Apply pagination and ordering
        query.OrderBy($"u.{nameof(User.UserName)}")
             .Offset((request.Page - 1) * request.PageSize)
             .Limit(request.PageSize);

        var compiledQuery = _compiler.Compile(query);
        var users = await connection.QueryAsync<UserTableDto>(compiledQuery.Sql, compiledQuery.NamedBindings);

        // Convert to final result format
        var result = users.Select(u => new UserTableDto
        {
            Id = u.Id,
            UserName = u.UserName,
            Email = u.Email,
            FullName = u.FullName,
            Phone = u.Phone,
            Avatar = u.Avatar,
            IsActive = u.IsActive,
            isLocked = u.isLocked,
            Roles = string.IsNullOrEmpty(u.RolesString) 
                ? new List<string>() 
                : u.RolesString.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        }).ToList();

        return (result, total); // Return 0 for total count as requested
    }

    public async Task<(List<UserSelectDto> Items, int TotalCount)> GetPaginatedUser2SelectAsync(PaginationRequest request)
    {
        // Base query for active, non-deleted users
        var query = new Query($"{_tableName}")
            .Where(nameof(User.IsDeleted), false)
            .Where(nameof(User.IsActive), true);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query.Where(q => q
                .WhereLike($"{nameof(User.UserName)}", $"%{request.SearchTerm}%")
                .OrWhereLike($"{nameof(User.Email)}", $"%{request.SearchTerm}%")
                .OrWhereLike($"{nameof(User.FullName)}", $"%{request.SearchTerm}%"));
        }

        using var connection = _dbFactory.Connection;
        
        // Get total count
        var countQuery = query.Clone().AsCount();
        var countCompiled = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(countCompiled.Sql, countCompiled.NamedBindings);

        // Get paginated results
        var selectQuery = query.Clone()
            .Select([
                nameof(User.Id),
                nameof(User.UserName),
                nameof(User.Email),
                nameof(User.FullName),
                nameof(User.Avatar)
            ])
            .OrderBy(nameof(User.UserName))
            .Offset((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize);

        var selectCompiled = _compiler.Compile(selectQuery);
        var users = await connection.QueryAsync<User>(selectCompiled.Sql, selectCompiled.NamedBindings);

        var result = users.Select(user => new UserSelectDto
        {
            Id = user.Id.ToString(),
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            Avatar = user.Avatar,
        }).ToList();

        return (result, totalCount);
    }
}