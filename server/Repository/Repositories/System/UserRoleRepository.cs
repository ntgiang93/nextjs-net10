using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
using Model.DTOs.Base;
using Model.DTOs.System.User;
using Model.DTOs.System.UserRole;
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
    private readonly string _tableName; 

    public UserRoleRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
        _tableName = StringHelper.GetTableName<UserRole>();
    }

    public async Task<List<UserRole>> GetAllByUserAsync(string userId)
    {
        var query = new Query(_tableName)
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;

        var result = await connection.QueryAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<UserRole>> GetAllByRoleAsync(int roleId)
    {
        var query = new Query(_tableName)
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

    public async Task<UserRole> GetSingleAsync(int roleId, string userId)
    {
        var query = new Query(_tableName)
            .Where(nameof(UserRole.RoleId), roleId)
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);

        return result;
    }

    public async Task<bool> DeleteAsync(int roleId, string userId)
    {
        var query = new Query(_tableName)
            .Where(nameof(UserRole.RoleId), roleId)
            .Where(nameof(UserRole.UserId), userId);

        var compiledQuery = _compiler.Compile(query);
        using var connection = _dbFactory.Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserRole>(compiledQuery.Sql, compiledQuery.NamedBindings);
        if (result is null) return true;
        return await connection.DeleteAsync(result);
    }

    public async Task<bool> AddMemberAsync(AddMemberRoleDto dto, string createdBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var cols = new[]
            {
                nameof(UserRole.UserId),
                nameof(UserRole.RoleId)
            };

            var data = dto.UserIds.Select(userId => new object[] { userId, dto.RoleId }).ToList();

            var query = new Query(_tableName)
                .AsInsert(cols, data);

            var compiledQuery = _compiler.Compile(query);

            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in AddMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

    public async Task<bool> RemoveMemberAsync(int roleId, List<string> userIds, string updatedBy)
    {
        using var connection = _dbFactory.Connection;
        using var transaction = connection.BeginTransaction();
        try
        {
            var query = new Query(_tableName)
                .Where(nameof(UserRole.RoleId), roleId)
                .WhereIn(nameof(UserRole.UserId), userIds)
                .AsDelete();

            var compiledQuery = _compiler.Compile(query);

            await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings, transaction);

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in RemoveMemberAsync: {ex}");
            transaction.Rollback();
            return false;
        }
    }

    public async Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInRole(
        UserRoleCursorFilterDto filter)
    {
        var userTable = StringHelper.GetTableName<User>();
        using var connection = _dbFactory.Connection;

        // Query users NOT EXISTS in UserRole for the specified roleId
        var query = new Query(userTable)
            .Select(new[]
            {
                $"{userTable}.{nameof(User.Id)}",
                $"{userTable}.{nameof(User.FullName)}",
                $"{userTable}.{nameof(User.UserName)}",
                $"{userTable}.{nameof(User.Avatar)}",
                $"{userTable}.{nameof(User.CreatedAt)}"
            })
            .Where($"{userTable}.{nameof(User.IsDeleted)}", false)
            .Where($"{userTable}.{nameof(User.IsActive)}", true)
            .WhereNotExists(q => q
                .From(_tableName)
                .WhereColumns($"{_tableName}.{nameof(UserRole.UserId)}", "=", $"{userTable}.{nameof(User.Id)}")
                .Where($"{_tableName}.{nameof(UserRole.RoleId)}", filter.RoleId)
            );

        // Optional search
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            query.Where(q => q
                .WhereContains($"{userTable}.{nameof(User.FullName)}", filter.SearchTerm!)
                .OrWhereContains($"{userTable}.{nameof(User.UserName)}", filter.SearchTerm!)
            );
        }

        // Keyset pagination on User.CreatedAt
        if (filter.Cursor.HasValue)
        {
            query.Where($"{userTable}.{nameof(User.CreatedAt)}", "<", filter.Cursor.Value);
        }

        query.OrderByDesc($"{userTable}.{nameof(User.CreatedAt)}")
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
}