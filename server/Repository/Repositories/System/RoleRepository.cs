using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
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

    public RoleRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId)
    {
        string userRoleTable = StringHelper.GetTableName<UserRole>();
        string userTable = StringHelper.GetTableName<User>();
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT 
                u.{nameof(User.Id)},
                u.{nameof(User.Username)} as UserName,
                u.{nameof(User.FullName)},
                u.{nameof(User.Avatar)}
            FROM {userRoleTable} ur
            INNER JOIN {userTable}s u ON ur.{nameof(UserRole.UserId)} = u.{nameof(User.Id)}
            WHERE ur.{nameof(UserRole.RoleId)} = @roleId 
                AND u.{nameof(User.IsDeleted)} = 0 
                AND u.{nameof(User.IsActive)} = 1");

        using var connection = _connection;
        var result = await connection.QueryAsync<RoleMembersDto>(_sqlBuilder.ToString(), new { roleId });
        return result.ToList();
    }

    public async Task<List<string>> GetRolePermissionString(string role)
    {
        string rolePermissionTable = StringHelper.GetTableName<RolePermission>();
        var query = new Query(rolePermissionTable)
        .SelectRaw($"CONCAT({nameof(RolePermission.Role)}, '.', {nameof(RolePermission.Permission)}) as Permission");

        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermission.Role), "like", $"%{role}%");

        var compiledQuery = _compiler.Compile(query);

        using var connection = _connection;
        var permissions = await connection.QueryAsync<string>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return permissions.ToList();
    }

    public async Task<List<RolePermission>> GetRolePermission(string role)
    {
        var query = new Query(nameof(RolePermission));
        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermission.Role), "like", $"%{role}%");

        var compiledQuery = _compiler.Compile(query);

        using var connection = _connection;
        var permissions = await connection.QueryAsync<RolePermission>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return permissions.ToList();
    }

    public async Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var rolePermission in rolePermissions)
            {
                await connection.InsertAsync(rolePermission, transaction);
            }
            return true;
        });
    }

    public async Task<bool> DeleteRolePermissionAsync(IEnumerable<RolePermission> rolePermissions)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var rolePermission in rolePermissions)
            {
                await connection.DeleteAsync(rolePermission, transaction);
            }
            return true;
        });
    }
}