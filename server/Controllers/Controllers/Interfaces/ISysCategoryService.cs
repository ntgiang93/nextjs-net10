using System.Threading.Tasks;
using Model.DTOs.System;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces;

public interface ISysCategoryService : IGenericService<SysCategory, int>
{
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto categoryDto);
    Task<bool> UpdateCategoryAsync(UpdateCategoryDto categoryDto);
    Task<bool> DeleteCategoryAsync(int id);
}