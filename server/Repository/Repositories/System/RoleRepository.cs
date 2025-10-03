using System.Text;
using Dapper;
using Dapper.Contrib.Extensions;
using SqlKata;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;

namespace Repository.Repositories;

public class RoleRepository : GenericRepository<Role, int>, IRoleRepository
{
    private readonly StringBuilder _sqlBuilder;

    public RoleRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<string>> GetRolePermissionsString(string role)
    {
        var query = new Query(nameof(RolePermissions))
            .SelectRaw($"CONCAT({nameof(RolePermissions.Role)}, '.', {nameof(RolePermissions.Permission)}) as Permission");
            
        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermissions.Role), "like", $"%{role}%");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var permissions = await connection.QueryAsync<string>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return permissions.ToList();
    }

    public async Task<List<RolePermissions>> GetRolePermissions(string role)
    {
        var query = new Query(nameof(RolePermissions));
        if (!string.IsNullOrEmpty(role))
            query = query.Where(nameof(RolePermissions.Role), "like", $"%{role}%");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var permissions = await connection.QueryAsync<RolePermissions>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return permissions.ToList();
    }

    public async Task<bool> AddRolePermissionsAsync(IEnumerable<RolePermissions> rolePermissions)
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

    public async Task<bool> DeleteRolePermissionsAsync(IEnumerable<RolePermissions> rolePermissions)
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

    public async Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId)
    {
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT 
                u.{nameof(User.Id)},
                u.{nameof(User.Username)} as UserName,
                u.{nameof(User.FullName)},
                u.{nameof(User.Avatar)}
            FROM {nameof(UserRoles)} ur
            INNER JOIN {nameof(User)}s u ON ur.{nameof(UserRoles.UserId)} = u.{nameof(User.Id)}
            WHERE ur.{nameof(UserRoles.RoleId)} = @roleId 
                AND u.{nameof(User.IsDeleted)} = 0 
                AND u.{nameof(User.IsActive)} = 1");

        using var connection = Connection;
        var result = await connection.QueryAsync<RoleMembersDto>(_sqlBuilder.ToString(), new { roleId });
        return result.ToList();
    }
}