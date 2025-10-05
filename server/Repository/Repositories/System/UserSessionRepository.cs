using Dapper;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories;

public class UserSessionRepository : GenericRepository<UserToken, long>, IUserSessionRepository
{
    private readonly StringBuilder _sqlBuilder;

    public UserSessionRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<UserToken?> GetByTokenAsync(string token)
    {
        var query = new Query($"{nameof(UserToken)}")
            .Where(nameof(UserToken.AccessTokenId), token)
            .Where(nameof(UserToken.IsDeleted), false);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryFirstOrDefaultAsync<UserToken>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result;
    }

    public async Task<List<UserToken>> GetActiveTokensByUserAsync(long userId)
    {
        var query = new Query($"{nameof(UserToken)}")
            .Where(nameof(UserToken.UserId), userId)
            .Where(nameof(UserToken.IsDeleted), false)
            .Where(nameof(UserToken.Expires), ">", DateTime.UtcNow)
            .OrderByDesc(nameof(UserToken.CreatedAt));

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryAsync<UserToken>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserToken)} 
                SET {nameof(UserToken.IsDeleted)} = 1, {nameof(UserToken.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserToken.AccessTokenId)} = @token");

            var rowsAffected = await connection.ExecuteAsync(_sqlBuilder.ToString(), 
                new { token, updatedAt = DateTime.UtcNow }, transaction);

            return rowsAffected > 0;
        });
    }

    public async Task<bool> RevokeAllUserTokenAsync(long userId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserToken)} 
                SET {nameof(UserToken.IsDeleted)} = 1, {nameof(UserToken.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserToken.UserId)} = @userId");

            await connection.ExecuteAsync(_sqlBuilder.ToString(), 
                new { userId, updatedAt = DateTime.UtcNow }, transaction);

            return true;
        });
    }

    public async Task<bool> CleanupExpiredTokensAsync()
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserToken)} 
                SET {nameof(UserToken.IsDeleted)} = 1, {nameof(UserToken.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserToken.Expires)} < @now AND {nameof(UserToken.IsDeleted)} = 0");

            await connection.ExecuteAsync(_sqlBuilder.ToString(), 
                new { now = DateTime.UtcNow, updatedAt = DateTime.UtcNow }, transaction);

            return true;
        });
    }

    public async Task<int> GetActiveTokenCountByUserAsync(long userId)
    {
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT COUNT(*) 
            FROM {nameof(UserToken)} 
            WHERE {nameof(UserToken.UserId)} = @userId 
                AND {nameof(UserToken.IsDeleted)} = 0 
                AND {nameof(UserToken.Expires)} > @now");

        using var connection = _connection;
        connection.Open();
        var count = await connection.QuerySingleAsync<int>(_sqlBuilder.ToString(), 
            new { userId, now = DateTime.UtcNow });
        
        return count;
    }
}