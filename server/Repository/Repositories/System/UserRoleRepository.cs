using Dapper;
using Dapper.Contrib.Extensions;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories.System;

public class UserRoleRepository : GenericRepository<User, string>, IUserRoleRepository
{
    private readonly StringBuilder _sqlBuilder;

    public UserRoleRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<UserRole>> GetAllByUserAsync(string userId)
    {
        var query = new Query(nameof(UserRole))
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;

        var result = await connection.QueryAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<UserRole>> GetAllByRoleAsync(int roleId)
    {
        var query = new Query(nameof(UserRole))
            .Where(nameof(UserRole.RoleId), roleId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> AddUserRoleAsync(IEnumerable<UserRole> userRoles)
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

    public async Task<bool> DeleteUserRoleAsync(IEnumerable<UserRole> userRoles)
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
    public async Task<bool> BulkAddUserRoleAsync(IEnumerable<UserRole> userRoles)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                INSERT INTO {nameof(UserRole)} ({nameof(UserRole.UserId)}, {nameof(UserRole.RoleId)})
                VALUES (@{nameof(UserRole.UserId)}, @{nameof(UserRole.RoleId)})");
            
            await connection.ExecuteAsync(_sqlBuilder.ToString(), userRoles, transaction);
            return true;
        });
    }

    public async Task<bool> DeleteUserRoleByUserIdAsync(long userId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($"DELETE FROM {nameof(UserRole)} WHERE {nameof(UserRole.UserId)} = @UserId");
            await connection.ExecuteAsync(_sqlBuilder.ToString(), new { UserId = userId }, transaction);
            return true;
        });
    }

    public async Task<bool> DeleteUserRoleByRoleIdAsync(long roleId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($"DELETE FROM {nameof(UserRole)} WHERE {nameof(UserRole.RoleId)} = @RoleId");
            await connection.ExecuteAsync(_sqlBuilder.ToString(), new { RoleId = roleId }, transaction);
            return true;
        });
    }
}