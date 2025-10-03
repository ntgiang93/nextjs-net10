using System.Text;
using Dapper;
using SqlKata;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;

namespace Repository.Repositories;

public class UserSessionRepository : GenericRepository<UserTokens, long>, IUserSessionRepository
{
    private readonly StringBuilder _sqlBuilder;

    public UserSessionRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<UserTokens?> GetByTokenAsync(string token)
    {
        var query = new Query($"{nameof(UserTokens)}")
            .Where(nameof(UserTokens.AccessTokenId), token)
            .Where(nameof(UserTokens.IsDeleted), false);

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryFirstOrDefaultAsync<UserTokens>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result;
    }

    public async Task<List<UserTokens>> GetActiveTokensByUserAsync(long userId)
    {
        var query = new Query($"{nameof(UserTokens)}")
            .Where(nameof(UserTokens.UserId), userId)
            .Where(nameof(UserTokens.IsDeleted), false)
            .Where(nameof(UserTokens.Expires), ">", DateTime.UtcNow)
            .OrderByDesc(nameof(UserTokens.CreatedAt));

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<UserTokens>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserTokens)} 
                SET {nameof(UserTokens.IsDeleted)} = 1, {nameof(UserTokens.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserTokens.AccessTokenId)} = @token");

            var rowsAffected = await connection.ExecuteAsync(_sqlBuilder.ToString(), 
                new { token, updatedAt = DateTime.UtcNow }, transaction);

            return rowsAffected > 0;
        });
    }

    public async Task<bool> RevokeAllUserTokensAsync(long userId)
    {
        return await ExecuteInTransactionAsync(async (connection, transaction) =>
        {
            _sqlBuilder.Clear();
            _sqlBuilder.Append($@"
                UPDATE {nameof(UserTokens)} 
                SET {nameof(UserTokens.IsDeleted)} = 1, {nameof(UserTokens.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserTokens.UserId)} = @userId");

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
                UPDATE {nameof(UserTokens)} 
                SET {nameof(UserTokens.IsDeleted)} = 1, {nameof(UserTokens.UpdatedAt)} = @updatedAt 
                WHERE {nameof(UserTokens.Expires)} < @now AND {nameof(UserTokens.IsDeleted)} = 0");

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
            FROM {nameof(UserTokens)} 
            WHERE {nameof(UserTokens.UserId)} = @userId 
                AND {nameof(UserTokens.IsDeleted)} = 0 
                AND {nameof(UserTokens.Expires)} > @now");

        using var connection = Connection;
        var count = await connection.QuerySingleAsync<int>(_sqlBuilder.ToString(), 
            new { userId, now = DateTime.UtcNow });
        
        return count;
    }
}