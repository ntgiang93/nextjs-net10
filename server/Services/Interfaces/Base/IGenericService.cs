using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Dapper;

namespace Service.Interfaces.Base;

public interface IGenericService<TEntity, TKey>
{
    /// <summary>
    ///     Gets an entity by its identifier.
    /// </summary>
    /// <typeparam name="TDto">The type of the data transfer object.</typeparam>
    /// <param name="id">The identifier of the entity.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the data transfer object.</returns>
    Task<TDto> GetByIdAsync<TDto>(TKey id);

    /// <summary>
    ///     Gets a single entity based on a predicate.
    /// </summary>
    /// <typeparam name="TDto">The type of the data transfer object.</typeparam>
    /// <param name="predicate">The predicate to filter entities.</param>
    /// <param name="trackChanges">Whether to track changes.</param>
    /// <returns>The single entity that matches the predicate.</returns>
    Task<TDto?> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate, bool trackChanges = false);

    /// <summary>
    ///     Gets all entities.
    /// </summary>
    /// <typeparam name="TDto">The type of the data transfer object.</typeparam>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains a collection of data transfer
    ///     objects.
    /// </returns>
    Task<IEnumerable<TDto>> GetAllAsync<TDto>();

    /// <summary>
    ///     Finds entities based on a predicate.
    /// </summary>
    /// <typeparam name="TDto">The type of the data transfer object.</typeparam>
    /// <param name="predicate">The predicate to filter entities.</param>
    /// <param name="trackChanges">Indicates whether to track changes.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains a collection of data transfer
    ///     objects.
    /// </returns>
    Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate, bool trackChanges = false);

    /// <summary>
    ///     Creates a new entity.
    /// </summary>
    /// <param name="entity">The entity to create.</param>
    /// <param name="username">Username for audit trail</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the primary key of the created entity.</returns>
    Task<TKey?> CreateAsync(TEntity entity, string username = "System");

    /// <summary>
    ///     Updates an existing entity.
    /// </summary>
    /// <param name="entity">The entity to update</param>
    /// <param name="username">Username for audit trail</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task<bool> UpdateAsync(TEntity entity, string username = "System");

    /// <summary>
    ///     Soft deletes an entity by setting IsDeleted flag.
    /// </summary>
    /// <param name="id">The identifier of the entity.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task<bool> SoftDeleteAsync(TKey id);

    /// <summary>
    ///     Hard deletes an entity from the database.
    /// </summary>
    /// <param name="id">The identifier of the entity.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task<bool> HardDeleteAsync(TKey id);

    /// <summary>
    ///     Executes a stored procedure and returns a collection of results.
    /// </summary>
    /// <typeparam name="T">The type of the result.</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure.</param>
    /// <param name="parameters">The parameters for the stored procedure.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a collection of results.</returns>
    Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure, DynamicParameters? parameters = null);

    /// <summary>
    ///     Executes a stored procedure and returns a single result.
    /// </summary>
    /// <typeparam name="T">The type of the result.</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure.</param>
    /// <param name="parameters">The parameters for the stored procedure.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the result.</returns>
    Task<T> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null);

    /// <summary>
    ///     Executes a stored procedure with pagination and returns a collection of results and the total count.
    /// </summary>
    /// <typeparam name="T">The type of the result.</typeparam>
    /// <param name="storedProcedure">The name of the stored procedure.</param>
    /// <param name="parameters">The parameters for the stored procedure.</param>
    /// <param name="pageIndex">The index of the page.</param>
    /// <param name="pageSize">The size of the page.</param>
    /// <returns>
    ///     A task that represents the asynchronous operation. The task result contains a collection of results and the
    ///     total count.
    /// </returns>
    Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(string storedProcedure,
        DynamicParameters? parameters = null, int pageIndex = 1, int pageSize = 10);
}