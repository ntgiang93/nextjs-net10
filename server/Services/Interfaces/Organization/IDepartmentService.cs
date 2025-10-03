using System.Collections.Generic;
using System.Threading.Tasks;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;

namespace Service.Interfaces.Organization;

public interface IDepartmentService : IGenericService<Department, int>
{
    /// <summary>
    ///     Gets department tree structure
    /// </summary>
    Task<List<TableDepartmentDto>> GetDepartmentTreeAsync();

    /// <summary>
    ///     Creates a new department
    /// </summary>
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto);

    /// <summary>
    ///     Updates an existing department
    /// </summary>
    Task<bool> UpdateDepartmentAsync(UpdateDepartmentDto dto);

    /// <summary>
    ///     Deletes a department
    /// </summary>
    Task<bool> DeleteDepartmentAsync(int id);
}