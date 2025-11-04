using System;
using System.Threading.Tasks;
using Common.Exceptions;
using Mapster;
using MimeDetective.Storage;
using Model.Constants;
using Model.DTOs.System;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces;
using Service.Services.Base;

namespace Service.Services.System;

public class SysCategoryService : GenericService<SysCategory, int>, ISysCategoryService
{
    private readonly ISysCategoryRepository _repository;

    public SysCategoryService(
        ISysCategoryRepository repository,
        IServiceProvider serviceProvider) : base(repository, serviceProvider)
    {
        _repository = repository;
    }
    
    public async Task<List<CategoryTreeDto>> GetTreeAsync()
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetTreeAsync");
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var data  = await FindAsync<SysCategory>(c => c.IsDeleted == false);
            var rawResult = data.Adapt<List<CategoryTreeDto>>();
            var tree = await MapToTree(rawResult);
            return tree;
        });
    }
    
    public async Task<List<CategoryDto>> GetByTypeAsync(string type)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetByTypeAsync", type);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var data  =
                await FindAsync<SysCategory>(c => c.Type == type && c.IsDeleted == false);
            var result = data.Adapt<List<CategoryDto>>();
            return result;
        });

    }

    public async Task<bool> CreateCategoryAsync(CategoryDto dto)
    {
        var existingCode =
            await GetSingleAsync<SysCategory>(c => c.Code == dto.Code && c.Type == dto.Type && c.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "CATEGORY_CODE_EXISTS");
        var category = dto.Adapt<SysCategory>();
        var id = await CreateAsync(category);
        return id > 0;
    }

    public async Task<bool> UpdateCategoryAsync(CategoryDto dto)
    {
        var existingCode = await GetSingleAsync<SysCategory>(c =>
            c.Id != dto.Id && c.Code == dto.Code && c.Type == dto.Type && c.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "CATEGORY_CODE_EXISTS");
        var category = await GetSingleAsync<SysCategory>(c => c.Id == dto.Id && c.IsDeleted == false);
        if (category == null) throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "CATEGORY_NOT_FOUND");
        category = dto.Adapt<SysCategory>();
        return await UpdateAsync(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        return await SoftDeleteAsync(id);
    }
    
    private async Task<List<CategoryTreeDto>> MapToTree(List<CategoryTreeDto> categories, string type = "")
    {
        var children = categories.FindAll(c => c.Type.Equals(type));
        foreach (var child in children)
        {
            child.Children = await MapToTree(categories, child.Code);
        }

        return children;
    }
}