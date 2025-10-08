using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
using Mapster;
using Model.Entities.System;
using Repository.Interfaces.Base;
using SqlKata.Compilers;
using System.Data;
using System.Linq.Expressions;

namespace Repository.Repositories.Base;

public class GenericRepository<TEntity, TKey> : IGenericRepository<TEntity, TKey>
    where TEntity : BaseEntity<TKey>
{
    protected readonly IDbConnectionFactory _dbFactory;
    protected readonly Compiler _compiler;
    private readonly ExpressionToSqlConverter _converter;

    public GenericRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
        _compiler = new SqlServerCompiler();
        _converter = new ExpressionToSqlConverter();
    }
    
    public virtual async Task<TDto> GetByIdAsync<TDto>(TKey id)
    {
        var entity = await _dbFactory.Connection.GetAsync<TEntity>(id);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<TDto> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        var sqlResult = _converter.Convert(predicate);
        var sql = $"SELECT * FROM {StringHelper.GetTableName<TEntity>()} WHERE {sqlResult.WhereClause}";
        var entity = await _dbFactory.Connection.QueryFirstOrDefaultAsync<TEntity>(sql, sqlResult.Parameters);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync<TDto>()
    {
        var entities = await _dbFactory.Connection.GetAllAsync<TEntity>();
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        var sqlResult = _converter.Convert(predicate);
        var sql = $"SELECT * FROM {StringHelper.GetTableName<TEntity>()} WHERE {sqlResult.WhereClause}";
        var entities = await _dbFactory.Connection.QueryAsync<TEntity>(sql, sqlResult.Parameters);
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<TKey> InsertAsync(TEntity entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsDeleted = false;        
        if (typeof(TKey) == typeof(string))
        {
            entity.Id = (TKey)(object)Ulid.NewUlid().ToString();
            await _dbFactory.Connection.InsertAsync(entity);
            return entity.Id;
        }
        else
        {
            var id = await _dbFactory.Connection.InsertAsync(entity);
            return (TKey)Convert.ChangeType(id, typeof(TKey));
        }
    }

    public virtual async Task<bool> UpdateAsync(TEntity entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        var result = await _dbFactory.Connection.UpdateAsync(entity);
        return result;
    }

    public virtual async Task<bool> DeleteAsync(TEntity entity)
    {
        var result = await _dbFactory.Connection.DeleteAsync<TEntity>(entity);
        return result;
    }

    public async Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _dbFactory.Connection.QueryAsync<T>(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<T?> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _dbFactory.Connection.QueryFirstOrDefaultAsync<T>(storedProcedure, parameters,
            commandType: CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure,
        DynamicParameters? parameters = null,
        int pageIndex = 1,
        int pageSize = 10)
    {
        var result = await _dbFactory.Connection.QueryMultipleAsync(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
        var items = await result.ReadAsync<T>();
        var totalCount = await result.ReadSingleAsync<int>();

        return (items, totalCount);
    }

    // Transaction support methods
    protected async Task<T> ExecuteInTransactionAsync<T>(Func<IDbConnection, IDbTransaction, Task<T>> operation)
    {
        using var transaction = _dbFactory.Connection.BeginTransaction();

        try
        {
            var result = await operation(_dbFactory.Connection, transaction);
            transaction.Commit();
            return result;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    protected async Task ExecuteInTransactionAsync(Func<IDbConnection, IDbTransaction, Task> operation)
    {
        using var transaction = _dbFactory.Connection.BeginTransaction();
        
        try
        {
            await operation(_dbFactory.Connection, transaction);
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}