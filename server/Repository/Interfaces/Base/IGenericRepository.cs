using System.Linq.Expressions;
using Dapper;
using Model.Entities.System;

namespace Repository.Interfaces.Base;

/// <summary>
///     Generic repository interface that provides standard data access operations for entities
/// </summary>
/// <typeparam name="TEntity">The entity type</typeparam>
/// <typeparam name="TKey">The entity primary key type</typeparam>
public interface IGenericRepository<TEntity, TKey> where TEntity : BaseEntity<TKey>
{
    /// <summary>
    /// Gets an entity by its primary key and maps it to the specified DTO
    /// </summary>
    /// <typeparam name="TDto">The DTO type to map the entity to</typeparam>
    /// <param name="id">The primary key value</param>
    /// <returns>The mapped entity or default value if not found</returns>
    Task<TDto> GetByIdAsync<TDto>(TKey id);

    /// <summary>
    ///     Gets a single entity based on the provided predicate and maps it to the specified DTO
    /// </summary>
    /// <typeparam name="TDto">The DTO type to map the entity to</typeparam>
    /// <param name="predicate">The filter expression</param>
    /// <returns>The mapped entity or default value if not found</returns>
    Task<TDto> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate);

    /// <summary>
    ///     Gets all entities and maps them to the specified DTO type
    /// </summary>
    /// <typeparam name="TDto">The DTO type to map the entities to</typeparam>
    /// <returns>Collection of mapped entities</returns>
    Task<IEnumerable<TDto>> GetAllAsync<TDto>();

    /// <summary>
    ///     Finds entities based on the provided predicate and maps them to the specified DTO type
    /// </summary>
    /// <typeparam name="TDto">The DTO type to map the entities to</typeparam>
    /// <param name="predicate">The filter expression</param>
    /// <returns>Collection of mapped entities</returns>
    Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate);

    /// <summary>
    ///     Inserts a new entity to the database
    /// </summary>
    /// <param name="entity">The entity to insert</param>
    /// <returns>The primary key of the inserted entity</returns>
    Task<TKey> InsertAsync(TEntity entity);

    /// <summary>
    ///     Updates an existing entity in the database
    /// </summary>
    /// <param name="entity">The entity to update</param>
    /// <returns>True if update was successful, false otherwise</returns>
    Task<bool> UpdateAsync(TEntity entity);

    /// <summary>
    ///     Deletes an entity from the database
    /// </summary>
    /// <param name="entity">The entity to delete</param>
    /// <returns>True if deletion was successful, false otherwise</returns>
    Task<bool> DeleteAsync(TEntity entity);

    /// <summary>
    ///     Executes a stored procedure and maps the results to the specified type
    /// </summary>
    /// <typeparam name="T">The type to map the stored procedure results to</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure</param>
    /// <param name="parameters">The parameters to pass to the stored procedure</param>
    /// <returns>Collection of mapped results</returns>
    Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure, DynamicParameters? parameters = null);

    /// <summary>
    ///     Executes a stored procedure and maps the first result to the specified type
    /// </summary>
    /// <typeparam name="T">The type to map the stored procedure result to</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure</param>
    /// <param name="parameters">The parameters to pass to the stored procedure</param>
    /// <returns>The first result mapped to the specified type</returns>
    Task<T?> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null);

    /// <summary>
    ///     Executes a stored procedure with pagination support and maps the results to the specified type
    /// </summary>
    /// <typeparam name="T">The type to map the stored procedure results to</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure</param>
    /// <param name="parameters">The parameters to pass to the stored procedure</param>
    /// <param name="pageIndex">The page index (1-based)</param>
    /// <param name="pageSize">The size of the page</param>
    /// <returns>Tuple containing the collection of mapped results and total count</returns>
    Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure,
        DynamicParameters? parameters = null,
        int pageIndex = 1,
        int pageSize = 10);
}