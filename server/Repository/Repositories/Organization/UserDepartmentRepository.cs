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
using Common.Extensions;

namespace Repository.Repositories.Organization;

public class UserDepartmentRepository : GenericRepository<UserDepartment, int>, IUserDepartmentRepository
{
    private readonly string _tableName;
    private readonly string _userTable;
    private readonly string _departmemtTable;

    public UserDepartmentRepository(IDbConnectionFactory factory) : base(factory)
    {
        _tableName = StringHelper.GetTableName<UserDepartment>();
        _userTable = StringHelper.GetTableName<User>();
        _departmemtTable = StringHelper.GetTableName<Department>();
    }

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetPaginatedAsync(UserDepartmentFilterDto filter)
    {
        var departmentIds = new List<int>(){filter.DepartmentId};
        using var connection = _dbFactory.Connection;
        if (filter.IsShowSubMembers)
        {
            var departmentQuery = new Query(_departmemtTable);
            departmentQuery.Select(
                    $"{nameof(Department.Id)}"
                )
                .Where($"{_tableName}.{nameof(Department.IsDeleted)}", false)
                .WhereRaw($"CONCAT('.',{_tableName}.{nameof(Department.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
                    filter.DepartmentId);
            var compiledDepartmentQuery = _compiler.Compile(departmentQuery);
            var result = await connection.QueryAsync<int>(compiledDepartmentQuery.Sql,
                compiledDepartmentQuery.NamedBindings);
            departmentIds.AddRange(result);
        }
        var query = new Query(_tableName);
        query.Select([
                    $"{_tableName}.{nameof(UserDepartment.Id)}",
                    $"{_userTable}.{nameof(User.Id)} as UserId",
                    $"{_userTable}.{nameof(User.FullName)}",
                    $"{_userTable}.{nameof(User.UserName)}",
                    $"{_userTable}.{nameof(User.Avatar)}"
            ])
            .Join(_userTable, $"{_tableName}.{nameof(UserDepartment.UserId)}", $"{_userTable}.{nameof(User.Id)}")
            .WhereLike($"{_userTable}.{nameof(User.FullName)}", filter.SearchTerm)
            .WhereLike($"{_userTable}.{nameof(User.UserName)}", filter.SearchTerm)
            .WhereIn($"{_tableName}.{nameof(UserDepartment.Id)}", departmentIds);
        
        var countQuery = query.Clone().AsCount();
        var compileCountQuery = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(compileCountQuery.Sql, compileCountQuery.NamedBindings);
        query.OrderBy($"{_userTable}.{nameof(User.FullName)}")
            .Offset((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize);
        var compileQuery = _compiler.Compile(query);
        var data = await connection.QueryAsync<DepartmentMemberDto>(compileQuery.Sql, compileQuery.NamedBindings);

        return new PaginatedResultDto<DepartmentMemberDto>
        {
            Items = data.ToList(),
            TotalCount = totalCount,
            PageIndex = filter.Page,
            PageSize = filter.PageSize
        };
    }
    
    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetUserNotInDepartment(int id)
    {
        var departmentIds = new List<int>(){id};
        using var connection = _dbFactory.Connection;
        var departmentQuery = new Query(_departmemtTable);
        departmentQuery.Select(
                $"{nameof(Department.Id)}"
            )
            .Where($"{_departmemtTable}.{nameof(Department.IsDeleted)}", false)
            .WhereRaw($"CONCAT('.',{_departmemtTable}.{nameof(Department.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
                id);
        var compiledDepartmentQuery = _compiler.Compile(departmentQuery);
        var result = await connection.QueryAsync<int>(compiledDepartmentQuery.Sql,
            compiledDepartmentQuery.NamedBindings);
        departmentIds.AddRange(result);
        var query = new Query(_userTable);
        query.Select([
                    $"0 as {nameof(UserDepartment.Id)}",
                    $"{_userTable}.{nameof(User.Id)} as UserId",
                    $"{_userTable}.{nameof(User.FullName)}",
                    $"{_userTable}.{nameof(User.UserName)}",
                    $"{_userTable}.{nameof(User.Avatar)}"
            ])
            .WhereNotExists(q => q
                .From(_tableName)
                .WhereColumns($"{_tableName}.{nameof(UserDepartment.UserId)}", "=", $"{_userTable}.{nameof(User.Id)}")
                .WhereIn($"{_tableName}.{nameof(UserDepartment.DepartmentId)}", departmentIds)
            );            
            //.WhereLike($"{_userTable}.{nameof(User.FullName)}", filter.SearchTerm)
            //.WhereLike($"{_userTable}.{nameof(User.UserName)}", filter.SearchTerm)
        /*query.OrderBy($"{_userTable}.{nameof(User.FullName)}")
            .Offset((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize);*/
        var compileQuery = _compiler.Compile(query);
        var data = await connection.QueryAsync<DepartmentMemberDto>(compileQuery.Sql, compileQuery.NamedBindings);

        return new PaginatedResultDto<DepartmentMemberDto>
        {
            Items = data.ToList(),
            TotalCount = 0,
            PageIndex = 1,
            PageSize = 100
        };
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
}