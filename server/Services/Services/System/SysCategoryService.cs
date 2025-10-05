using System;
using System.Threading.Tasks;
using Mapster;
using Model.DTOs.System;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces;
using Service.Services.Base;

namespace Service.Services.System;

public class SysCategoryService : GenericService<SysCategory, int>, ISysCategoryService
{
    private readonly ISysCategoryRepository _sysCategoryRepository;

    public SysCategoryService(
        ISysCategoryRepository sysCategoryRepository,
        IServiceProvider serviceProvider) : base(sysCategoryRepository, serviceProvider)
    {
    }

    public async Task<int> CreateCategoryAsync(CreateCategoryDto categoryDto)
    {
        var category = new SysCategory
        {
            Name = categoryDto.Name,
            Description = categoryDto.Description
        };

        var id = await CreateAsync(category);

        return id;
    }

    public async Task<bool> UpdateCategoryAsync(UpdateCategoryDto categoryDto)
    {
        var category = categoryDto.Adapt<SysCategory>();

        return await UpdateAsync(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        return await SoftDeleteAsync(id);
    }
}