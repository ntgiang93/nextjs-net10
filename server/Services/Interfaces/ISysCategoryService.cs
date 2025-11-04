using System.Collections.Generic;
using System.Threading.Tasks;
using MimeDetective.Storage;
using Model.DTOs.System;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces;

public interface ISysCategoryService : IGenericService<SysCategory, int>
{
    Task<List<CategoryDto>> GetByTypeAsync(string type);
    Task<bool> CreateCategoryAsync(CategoryDto dto);
    Task<bool> UpdateCategoryAsync(CategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);
    Task<List<CategoryTreeDto>> GetTreeAsync();
}