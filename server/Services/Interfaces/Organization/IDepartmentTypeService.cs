using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;

namespace Service.Interfaces.Organization;

public interface IDepartmentTypeService : IGenericService<DepartmentType, int>
{
    Task<DepartmentTypeDto> CreateDepartmentTypeAsync(CreateDepartmentTypeDto dto);
    Task<bool> UpdateDepartmentTypeAsync(UpdateDepartmentTypeDto dto);
}