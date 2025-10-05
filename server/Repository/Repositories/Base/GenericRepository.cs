using Common.Extensions;
using Dapper;
using Dapper.Contrib.Extensions;
using Mapster;
using Model.Entities.System;
using Repository.Interfaces.Base;
using SqlKata;
using SqlKata.Compilers;
using System.Data;
using System.Linq.Expressions;
using System.Reflection;

namespace Repository.Repositories.Base;

public class GenericRepository<TEntity, TKey> : IGenericRepository<TEntity, TKey>
    where TEntity : BaseEntity<TKey>
{
    protected readonly IDbConnection _connection;
    protected readonly Compiler _compiler;

    public GenericRepository(IDbConnectionFactory connection)
    {
        _connection = connection.CreateConnection();
        _compiler = new SqlServerCompiler();
    }
    
    public virtual async Task<TDto> GetByIdAsync<TDto>(TKey id)
    {
        using var connection = _connection;
        connection.Open();
        var entity = await connection.GetAsync<TEntity>(id);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<TDto> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        using var connection = _connection;
        connection.Open();
        string tableName = StringHelper.GetTableName<TEntity>();
        var query = new Query(tableName).Where(predicate);
        var compiledQuery = _compiler.Compile(query);
        var entity = await connection.QueryFirstOrDefaultAsync<TEntity>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return entity.Adapt<TDto>();
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync<TDto>()
    {
        using var connection = _connection;
        connection.Open();
        var entities = await connection.GetAllAsync<TEntity>();
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate)
    {
        using var connection = _connection;
        connection.Open();
        string tableName = StringHelper.GetTableName<TEntity>();
        var query = new Query(tableName).Where(predicate);
        var compiledQuery = _compiler.Compile(query);
        var entities = await connection.QueryAsync<TEntity>(compiledQuery.Sql, compiledQuery.NamedBindings);
        return entities.Adapt<IEnumerable<TDto>>();
    }

    public virtual async Task<TKey> InsertAsync(TEntity entity)
    {
        using var connection = _connection;
        connection.Open();
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsDeleted = false;        
        if (typeof(TKey) == typeof(string))
        {
            entity.Id = (TKey)(object)Ulid.NewUlid().ToString();
            await connection.InsertAsync(entity);
            return entity.Id;
        }
        else
        {
            var id = await connection.InsertAsync(entity);
            return (TKey)Convert.ChangeType(id, typeof(TKey));
        }
    }

    public virtual async Task<bool> UpdateAsync(TEntity entity)
    {
        using var connection = _connection;
        connection.Open();
        entity.UpdatedAt = DateTime.UtcNow;
        var result = await connection.UpdateAsync(entity);
        return result;
    }

    public virtual async Task<bool> DeleteAsync(TEntity entity)
    {
        using var connection = _connection;
        connection.Open();
        var result = await connection.DeleteAsync<TEntity>(entity);
        return result;
    }

    public async Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        using var connection = _connection;
        connection.Open(); 
        return await connection.QueryAsync<T>(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<T?> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        using var connection = _connection;
        connection.Open();
        return await connection.QueryFirstOrDefaultAsync<T>(storedProcedure, parameters,
            commandType: CommandType.StoredProcedure);
    }

    public async Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure,
        DynamicParameters? parameters = null,
        int pageIndex = 1,
        int pageSize = 10)
    {
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryMultipleAsync(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
        var items = await result.ReadAsync<T>();
        var totalCount = await result.ReadSingleAsync<int>();

        return (items, totalCount);
    }

    // Transaction support methods
    protected async Task<T> ExecuteInTransactionAsync<T>(Func<IDbConnection, IDbTransaction, Task<T>> operation)
    {
        using var connection = _connection;
        connection.Open();
        using var transaction = connection.BeginTransaction();
        
        try
        {
            var result = await operation(connection, transaction);
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
        using var connection = _connection;
        connection.Open();
        using var transaction = connection.BeginTransaction();
        
        try
        {
            await operation(connection, transaction);
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}