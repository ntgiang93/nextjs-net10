using Dapper;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;
using SqlKata;
using Common.Extensions;
using Model.DTOs.System.User;

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
        var departmentIds = new List<int>() { filter.DepartmentId };
        using var connection = _dbFactory.Connection;
        if (filter.IsShowSubMembers)
        {
            var departmentQuery = new Query(_departmemtTable);
            departmentQuery.Select(
                    $"{nameof(Department.Id)}"
                )
                .Where($"{_departmemtTable}.{nameof(Department.IsDeleted)}", false)
                .WhereRaw($"CONCAT('.',{_departmemtTable}.{nameof(Department.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
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
            .WhereIn($"{_tableName}.{nameof(UserDepartment.DepartmentId)}", departmentIds)
            .Where($"{_tableName}.{nameof(UserDepartment.IsDeleted)}", false)
            .Where($"{_userTable}.{nameof(User.IsDeleted)}", false);
        
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))

        {
            query.Where(q => q
                .WhereContains($"{_userTable}.{nameof(User.FullName)}", filter.SearchTerm!)
                .OrWhereContains($"{_userTable}.{nameof(User.UserName)}", filter.SearchTerm!)
            );
        }

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

    public async Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInDepartment(
        UserDeparmentCursorFilterDto filter)
    {
        using var connection = _dbFactory.Connection;

        // 1) Collect department ids (self + subs)
        var departmentIds = new List<int> { filter.DepartmentId };
        var departmentQuery = new Query(_departmemtTable)
            .Select($"{nameof(Department.Id)}")
            .Where($"{_departmemtTable}.{nameof(Department.IsDeleted)}", false)
            .WhereRaw($"CONCAT('.',{_departmemtTable}.{nameof(Department.TreePath)},'.') LIKE CONCAT('%.',?,'.%')",
                filter.DepartmentId);

        var compiledDepartmentQuery = _compiler.Compile(departmentQuery);
        var subIds =
            await connection.QueryAsync<int>(compiledDepartmentQuery.Sql, compiledDepartmentQuery.NamedBindings);
        departmentIds.AddRange(subIds);

        // 2) Base query: users NOT EXISTS in UserDepartments for those departmentIds
        var query = new Query(_userTable)
            .Select(new[]
            {
                $"{_userTable}.{nameof(User.Id)}",
                $"{_userTable}.{nameof(User.FullName)}",
                $"{_userTable}.{nameof(User.UserName)}",
                $"{_userTable}.{nameof(User.Avatar)}",
                $"{_userTable}.{nameof(User.CreatedAt)}"
            })
            .WhereNotExists(q => q
                .From(_tableName)
                .WhereColumns($"{_tableName}.{nameof(UserDepartment.UserId)}", "=", $"{_userTable}.{nameof(User.Id)}")
                .WhereIn($"{_tableName}.{nameof(UserDepartment.DepartmentId)}", departmentIds)
            );

        // Optional search
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            query.Where(q => q
                .WhereContains($"{_userTable}.{nameof(User.FullName)}", filter.SearchTerm!)
                .OrWhereContains($"{_userTable}.{nameof(User.UserName)}", filter.SearchTerm!)
            );
        }

        // 3) Keyset pagination on User.CreatedTime
        if (filter.Cursor.HasValue)
        {
            query.Where($"{_userTable}.{nameof(User.CreatedAt)}", "<", filter.Cursor.Value);
        }

        query.OrderByDesc($"{_userTable}.{nameof(User.CreatedAt)}")
            .Limit(filter.Limit + 1); // fetch one extra to know if there is more

        var compiled = _compiler.Compile(query);
        var rows = (await connection.QueryAsync<UserSelectDto>(compiled.Sql, compiled.NamedBindings)).ToList();

        var hasMore = rows.Count > filter.Limit;
        if (hasMore)
        {
            rows = rows.Take(filter.Limit).ToList();
        }

        var nextCursor = rows.Count > 0 ? rows[^1].CreatedAt : default;

        return new CursorPaginatedResultDto<UserSelectDto, DateTime>
        {
            Items = rows,
            NextCursor = hasMore ? nextCursor : default,
            HasMore = hasMore
        };
    }

    public async Task<bool> AddMemberAsync(AddMemberDepartmentDto dto, string createdBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var cols = new[]
            {
                nameof(UserDepartment.UserId), nameof(UserDepartment.DepartmentId), nameof(UserDepartment.IsDeleted),
                nameof(UserDepartment.CreatedAt), nameof(UserDepartment.CreatedBy)
            };
            var data = dto.UserIds.Select(userId => new object[] { userId, dto.DepartmentId, false, DateTime.Now, createdBy }).ToList();

            var query = new Query(_tableName)
                .AsInsert(cols, data);

            var compiledQuery = _compiler.Compile(query);

            // Execute the query
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            // Use a proper logging framework
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }
    
    public async Task<bool> RemoveMemberAsync(List<int> ids, string updatedBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var query = new Query(_tableName)
                .WhereIn(nameof(UserDepartment.Id), ids)
                .AsUpdate(new
                {
                    IsDeleted = true,
                    UpdatedAt = DateTime.Now,
                    UpdatedBy = updatedBy
                });

            var compiledQuery = _compiler.Compile(query);

            // Execute the query
            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            // Use a proper logging framework
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

}