using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
using Model.Constants;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Data;
using System.Text;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.DTOs.System.Role;

namespace Repository.Repositories;

public class RoleRepository : GenericRepository<Role, int>, IRoleRepository
{
    private readonly string _rolePermissitonTable = StringHelper.GetTableName<RolePermission>();
    private readonly string _userTable = StringHelper.GetTableName<User>();

    public RoleRepository(IDbConnectionFactory factory) : base(factory)
    {

    }

    public async Task<PaginatedResultDto<RoleMembersDto>> GetRoleMembersAsync(GetRoleMembersDto filter)
    {
        string userRoleTable = StringHelper.GetTableName<UserRole>();
        var query = new Query(userRoleTable)
            .SelectRaw($"{_userTable}.{nameof(User.Id)}, {_userTable}.{nameof(User.UserName)}, {_userTable}.{nameof(User.FullName)}, {_userTable}.{nameof(User.Avatar)}")
            .Join(_userTable, $"{userRoleTable}.{nameof(UserRole.UserId)}", $"{_userTable}.{nameof(User.Id)}")
            .Where($"{userRoleTable}.{nameof(UserRole.RoleId)}", filter.RoleId)
            .Where($"{_userTable}.{nameof(User.IsDeleted)}", 0)
            .Where($"{_userTable}.{nameof(User.IsActive)}", 1);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            query.Where(q => q.WhereContains($"{_userTable}.{nameof(User.UserName)}", filter.SearchTerm)
                .OrWhereContains($"{_userTable}.{nameof(User.FullName)}", filter.SearchTerm));
        }
        
        var connection = _dbFactory.Connection;
        var countQuery = query.Clone().AsCount();
        var compileCountQuery = _compiler.Compile(countQuery);
        var totalCount = await connection.QuerySingleAsync<int>(compileCountQuery.Sql, compileCountQuery.NamedBindings);
        query.OrderByDesc($"{_userTable}.{nameof(User.CreatedAt)}")
            .Offset((filter.Page - 1) * filter.PageSize)
            .Limit(filter.PageSize);
        var compileQuery = _compiler.Compile(query);
        var data = await connection.QueryAsync<RoleMembersDto>(compileQuery.Sql, compileQuery.NamedBindings);

        return new PaginatedResultDto<RoleMembersDto>
        {
            Items = data.ToList(),
            TotalCount = totalCount,
            PageIndex = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<List<RolePermission>> GetRolePermission(int roleId)
    {
        var query = new Query(_rolePermissitonTable);
        query = query.Where(nameof(RolePermission.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var rows = await connection.QueryAsync<RolePermission>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rows.ToList();
    }

    public async Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        var aggregated = rolePermissions
        .GroupBy(x => new { x.RoleId, x.SysModule })
        .Select(g => new RolePermission
        {
            RoleId = g.Key.RoleId,
            SysModule = g.Key.SysModule,
            Permission = g.Select(x => x.Permission)
                          .Aggregate(EPermission.None, (acc, cur) => acc | cur)
        })
        .ToList();
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var rolePermission in aggregated)
            {
                await connection.InsertAsync(rolePermission, transaction);
            }
            return true;
        });
    }

    public async Task<bool> DeleteRolePermissionAsync(int roleId)
    {
        string rolePermissionTable = StringHelper.GetTableName<RolePermission>();
        var deleteQuery = new Query(rolePermissionTable)
            .Where(nameof(RolePermission.RoleId), roleId)
            .AsDelete();

        var compiled = _compiler.Compile(deleteQuery);

        var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var rows = await connection.ExecuteAsync(compiled.Sql, compiled.NamedBindings, transaction);
            transaction.Commit();
            return rows > 0;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}