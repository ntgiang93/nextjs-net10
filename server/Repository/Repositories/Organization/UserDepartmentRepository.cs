using Dapper;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories.Organization;

public class UserDepartmentRepository : GenericRepository<UserDepartment, int>, IUserDepartmentRepository
{
    private readonly StringBuilder _sqlBuilder;

    public UserDepartmentRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetPaginatedAsync(UserDepartmentFilterDto filter)
    {
        var parameters = new DynamicParameters();
        var whereConditions = new List<string> 
        { 
            $"ud.{nameof(UserDepartment.DepartmentId)} = @departmentId", 
            $"ud.{nameof(UserDepartment.IsDeleted)} = 0" 
        };
        
        parameters.Add("departmentId", filter.DepartmentId);

        // Apply search filter
        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            whereConditions.Add($"LOWER(u.{nameof(User.FullName)}) LIKE @searchTerm");
            parameters.Add("searchTerm", $"%{filter.SearchTerm.ToLower()}%");
        }

        var whereClause = string.Join(" AND ", whereConditions);

        // Get total count
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT COUNT(*)
            FROM {nameof(UserDepartment)}s ud
            INNER JOIN {nameof(User)}s u ON ud.{nameof(UserDepartment.UserId)} = u.{nameof(User.Id)}
            WHERE ").Append(whereClause);

        var connection = _dbFactory.Connection;
        var totalCount = await connection.QuerySingleAsync<int>(_sqlBuilder.ToString(), parameters);

        // Get paginated results
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT 
                ud.{nameof(UserDepartment.Id)},
                ud.{nameof(UserDepartment.UserId)},
                ud.{nameof(UserDepartment.IsPrimary)},
                u.{nameof(User.FullName)} as UserFullName,
                ud.{nameof(UserDepartment.JobTitleCode)}
            FROM {nameof(UserDepartment)}s ud
            INNER JOIN {nameof(User)}s u ON ud.{nameof(UserDepartment.UserId)} = u.{nameof(User.Id)}
            WHERE ").Append(whereClause).Append($@"
            ORDER BY ud.{nameof(UserDepartment.Id)} DESC
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY");

        parameters.Add("offset", (filter.PageNumber - 1) * filter.PageSize);
        parameters.Add("pageSize", filter.PageSize);

        var items = await connection.QueryAsync<DepartmentMemberDto>(_sqlBuilder.ToString(), parameters);

        return new PaginatedResultDto<DepartmentMemberDto>
        {
            Items = items.ToList(),
            TotalCount = totalCount,
            PageIndex = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    public async Task<UserDepartment?> GetUserPrimaryDepartmentAsync(long userId)
    {
        var query = new Query($"{nameof(UserDepartment)}s")
            .Where(nameof(UserDepartment.UserId), userId)
            .Where(nameof(UserDepartment.IsPrimary), true)
            .Where(nameof(UserDepartment.IsDeleted), false);

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserDepartment>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result;
    }

    public async Task<List<UserDepartmentDto>> GetUserDepartmentAsync(long userId)
    {
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT 
                ud.{nameof(UserDepartment.Id)},
                ud.{nameof(UserDepartment.UserId)},
                ud.{nameof(UserDepartment.DepartmentId)},
                ud.{nameof(UserDepartment.IsPrimary)},
                ud.{nameof(UserDepartment.JobTitleCode)},
                d.{nameof(Department.Name)} as DepartmentName
            FROM {nameof(UserDepartment)}s ud
            INNER JOIN {nameof(Department)}s d ON ud.{nameof(UserDepartment.DepartmentId)} = d.{nameof(Department.Id)}
            WHERE ud.{nameof(UserDepartment.UserId)} = @userId AND ud.{nameof(UserDepartment.IsDeleted)} = 0");

        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<UserDepartmentDto>(_sqlBuilder.ToString(), new { userId });
        
        return result.ToList();
    }

    public async Task<List<UserDepartment>> GetByDepartmentAsync(int departmentId)
    {
        var query = new Query($"{nameof(UserDepartment)}s")
            .Where(nameof(UserDepartment.DepartmentId), departmentId)
            .Where(nameof(UserDepartment.IsDeleted), false);

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<UserDepartment>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> SetPrimaryDepartmentAsync(long userId, int departmentId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            // First, remove primary flag from all user departments
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserDepartment)}s 
                SET {nameof(UserDepartment.IsPrimary)} = 0, {nameof(UserDepartment.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserDepartment.UserId)} = @userId");
            
            await connection.ExecuteAsync(_sqlBuilder.ToString(), new { userId, updatedAt = DateTime.UtcNow }, transaction);

            // Then, set the specified department as primary
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserDepartment)}s 
                SET {nameof(UserDepartment.IsPrimary)} = 1, {nameof(UserDepartment.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserDepartment.UserId)} = @userId AND {nameof(UserDepartment.DepartmentId)} = @departmentId");
            
            var rowsAffected = await connection.ExecuteAsync(_sqlBuilder.ToString(), 
                new { userId, departmentId, updatedAt = DateTime.UtcNow }, transaction);

            return rowsAffected > 0;
        });
    }
}