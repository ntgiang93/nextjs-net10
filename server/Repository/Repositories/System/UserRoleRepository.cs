using System.Text;
using Dapper;
using Dapper.Contrib.Extensions;
using SqlKata;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;

namespace Repository.Repositories.System;

public class UserRoleRepository : GenericRepository<User, long>, IUserRoleRepository
{
    private readonly StringBuilder _sqlBuilder;

    public UserRoleRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<UserRoles>> GetAllByUserAsync(long userId)
    {
        var query = new Query(nameof(UserRoles))
            .Where(nameof(UserRoles.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<UserRoles>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<UserRoles>> GetAllByRoleAsync(long roleId)
    {
        var query = new Query(nameof(UserRoles))
            .Where(nameof(UserRoles.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<UserRoles>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> AddUserRolesAsync(IEnumerable<UserRoles> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var userRole in userRoles)
            {
                await connection.InsertAsync(userRole, transaction);
            }
            return true;
        });
    }

    public async Task<bool> DeleteUserRolesAsync(IEnumerable<UserRoles> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            foreach (var userRole in userRoles)
            {
                await connection.DeleteAsync(userRole, transaction);
            }
            return true;
        });
    }

    // Bulk operations for better performance
    public async Task<bool> BulkAddUserRolesAsync(IEnumerable<UserRoles> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                INSERT INTO {nameof(UserRoles)} ({nameof(UserRoles.UserId)}, {nameof(UserRoles.RoleId)})
                VALUES (@{nameof(UserRoles.UserId)}, @{nameof(UserRoles.RoleId)})");
            
            await connection.ExecuteAsync(_sqlBuilder.ToString(), userRoles, transaction);
            return true;
        });
    }

    public async Task<bool> DeleteUserRolesByUserIdAsync(long userId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($"DELETE FROM {nameof(UserRoles)} WHERE {nameof(UserRoles.UserId)} = @UserId");
            await connection.ExecuteAsync(_sqlBuilder.ToString(), new { UserId = userId }, transaction);
            return true;
        });
    }

    public async Task<bool> DeleteUserRolesByRoleIdAsync(long roleId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($"DELETE FROM {nameof(UserRoles)} WHERE {nameof(UserRoles.RoleId)} = @RoleId");
            await connection.ExecuteAsync(_sqlBuilder.ToString(), new { RoleId = roleId }, transaction);
            return true;
        });
    }
}