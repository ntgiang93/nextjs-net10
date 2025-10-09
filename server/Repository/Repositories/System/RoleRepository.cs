using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
using Model.Constants;
using Model.DTOs.System.Module;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories;

public class RoleRepository : GenericRepository<Role, int>, IRoleRepository
{
    private readonly StringBuilder _sqlBuilder;
    private readonly string _rolePermissitonTable;

    public RoleRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
        _rolePermissitonTable = StringHelper.GetTableName<RolePermission>();

    }

    public async Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId)
    {
        string userRoleTable = StringHelper.GetTableName<UserRole>();
        string userTable = StringHelper.GetTableName<User>();
        var query = new Query(userRoleTable)
            .SelectRaw($"{userTable}.{nameof(User.Id)}, {userTable}.{nameof(User.Username)}, {userTable}.{nameof(User.FullName)}, {userTable}.{nameof(User.Avatar)}")
            .Join(userTable, $"{userRoleTable}.{nameof(UserRole.UserId)}", $"{userTable}.{nameof(User.Id)}")
            .Where($"{userRoleTable}.{nameof(UserRole.RoleId)}", roleId)
            .Where($"{userTable}.{nameof(User.IsDeleted)}", 0)
            .Where($"{userTable}.{nameof(User.IsActive)}", 1);
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<RoleMembersDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return result.ToList();
    }

    public async Task<List<string>> GetRolePermissionString(string role)
    {
        var query = new Query(_rolePermissitonTable)
        .SelectRaw($"CONCAT({nameof(RolePermission.SysModule)}, '.', {nameof(RolePermission.Permission)}) as Permission");

        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermission.Role), "like", $"%{role}%");

        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var permissions = await connection.QueryAsync<string>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return permissions.ToList();
    }

    public async Task<List<RolePermission>> GetRolePermission(string role)
    {
        var query = new Query(_rolePermissitonTable);
        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermission.Role), role);

        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var rows = await connection.QueryAsync<RolePermission>(compiledQuery.Sql, compiledQuery.NamedBindings);
        var list = new List<RolePermission>();
        foreach (var rp in rows)
        {
            var permissions = Enum.GetValues(typeof(EPermission))
               .Cast<EPermission>()
               .Where(p => p != EPermission.None && (rp.Permission).HasFlag(p))
               .ToList();
            foreach (var p in permissions)
            {
                list.Add(new RolePermission
                {
                    SysModule = rp.SysModule,
                    Permission = p,
                    Role = rp.Role,
                });
            }
        }
        return list;
    }

    public async Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        var aggregated = rolePermissions
        .GroupBy(x => new { x.Role, x.SysModule })
        .Select(g => new RolePermission
        {
            Role = g.Key.Role,
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

    public async Task<bool> DeleteRolePermissionAsync(string role)
    {
        string rolePermissionTable = StringHelper.GetTableName<RolePermission>();
        var deleteQuery = new Query(rolePermissionTable)
            .Where(nameof(RolePermission.Role), role)
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