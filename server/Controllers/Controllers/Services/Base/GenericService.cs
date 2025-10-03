using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Dapper;
using IdGen;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.DependencyInjection;
using Common.Exceptions;
using Common.Security;
using Model.Constants;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Service.Interfaces.Base;

namespace Service.Services.Base;

public class GenericService<TEntity, TKey> : IGenericService<TEntity, TKey>
    where TEntity : BaseEntity<TKey>
{
    protected readonly string _cachePrefix;
    protected readonly IGenericRepository<TEntity, TKey> _repository;
    protected readonly IServiceProvider _serviceProvider;

    public GenericService(IGenericRepository<TEntity, TKey> repository, IServiceProvider serviceProvider)
    {
        _repository = repository;
        _serviceProvider = serviceProvider;
        _cachePrefix = typeof(TEntity).Name + "_";
    }

    protected ISysMessageService SysMsg => _serviceProvider.GetRequiredService<ISysMessageService>();
    protected CacheManager CacheManager => _serviceProvider.GetRequiredService<CacheManager>();
    protected IdGenerator IdGenerator => _serviceProvider.GetRequiredService<IdGenerator>();

    public virtual async Task<TDto> GetByIdAsync<TDto>(TKey id)
    {
        return await _repository.GetByIdAsync<TDto>(id);
    }

    public virtual async Task<TDto?> GetSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate,
        bool trackChanges = false)
    {
        return await _repository.GetSingleAsync<TDto>(predicate, trackChanges);
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync<TDto>()
    {
        var cacheKey = $"{_cachePrefix}GetAll";
        return await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _repository.GetAllAsync<TDto>(); });
    }

    public virtual async Task<IEnumerable<TDto>> FindAsync<TDto>(Expression<Func<TEntity, bool>> predicate,
        bool trackChanges = false)
    {
        return await _repository.FindAsync<TDto>(predicate, trackChanges);
    }

    public virtual async Task<bool> UpdateAsync(TEntity entity, string username = "System")
    {
        // We need to get the entity by ID first to verify it exists
        var existingEntity = await _repository.GetByIdAsync<TEntity>(entity.Id);

        if (existingEntity == null)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg));
        entity.CreatedBy = existingEntity.CreatedBy;
        entity.CreatedAt = existingEntity.CreatedAt;
        entity.IsDeleted = existingEntity.IsDeleted;
        entity.UpdatedBy = UserContext.Current?.Username ?? username;
        entity.UpdatedAt = DateTime.UtcNow;
        var result = await _repository.UpdateAsync(entity);
        if (result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }

    public virtual async Task<int> BatchUpdateAsync(Expression<Func<TEntity, bool>> predicate,
        Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>> setPropertyCalls)
    {
        var result = await _repository.BatchUpdateAsync(predicate, setPropertyCalls);
        if (result > 0)
            // Clear cache when batch update is successful
            CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }

    public virtual async Task<bool> SoftDeleteAsync(TKey id)
    {
        // We need to get the entity by ID first to verify it exists
        var existingEntity =
            await _repository.GetSingleAsync<TEntity>(e => e.Id != null && e.Id.Equals(id) && !e.IsDeleted);

        if (existingEntity != null)
        {
            existingEntity.IsDeleted = true;
            existingEntity.UpdatedBy = UserContext.Current?.Username ?? "System";
            existingEntity.UpdatedAt = DateTime.UtcNow;
            var result = await _repository.UpdateAsync(existingEntity);
            if (result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
            return result;
        }

        return true; // If the entity doesn't exist, we consider it "deleted"
    }

    public virtual async Task<bool> HardDeleteAsync(TKey id)
    {
        var result = await _repository.DeleteAsync(id);
        if (result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }

    // Query access methods
    public virtual async Task<IQueryable<TEntity>> GetQueryableAsync(bool trackChanges = false)
    {
        return await _repository.GetQueryable(trackChanges);
    }

    public virtual async Task<(IEnumerable<TDto> Items, int TotalCount)> FindPaginationAsync<TDto>(
        Expression<Func<TEntity, bool>> predicate, int pageIndex, int pageSize, bool trackChanges = false)
    {
        return await _repository.FindPaginationAsync<TDto>(predicate, pageIndex, pageSize, trackChanges);
    }

    public virtual async Task<IEnumerable<T>> ExecuteSPAsync<T>(string storedProcedure,
        DynamicParameters? parameters = null)
    {
        return await _repository.ExecuteSPAsync<T>(storedProcedure, parameters);
    }

    public virtual async Task<T> ExecuteSPSingleAsync<T>(string storedProcedure, DynamicParameters? parameters = null)
    {
        return await _repository.ExecuteSPSingleAsync<T>(storedProcedure, parameters);
    }

    public virtual async Task<(IEnumerable<T> Items, int TotalCount)> ExecuteSPWithPaginationAsync<T>(
        string storedProcedure, DynamicParameters? parameters = null, int pageIndex = 1, int pageSize = 10)
    {
        return await _repository.ExecuteSPWithPaginationAsync<T>(storedProcedure, parameters, pageIndex, pageSize);
    }

    public virtual async Task<TEntity?> CreateAsync(TEntity entity, string username = "System")
    {
        entity.CreatedBy = UserContext.Current?.Username ?? username;
        entity.CreatedAt = DateTime.UtcNow;
        if (typeof(TKey) == typeof(long) && Convert.ToInt64(entity.Id) == 0)
            entity.Id = (TKey)(object)IdGenerator.CreateId();
        var createdEntity = await _repository.AddAsync(entity);
        if (createdEntity != null) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return createdEntity;
    }
}