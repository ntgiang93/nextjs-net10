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
    Task<List<DepartmentDto>> GetDepartmentTreeAsync();

    /// <summary>
    ///     Creates a new department
    /// </summary>
    Task<DepartmentDto> CreateDepartmentAsync(DetailDepartmentDto dto);

    /// <summary>
    ///     Updates an existing department
    /// </summary>
    Task<bool> UpdateDepartmentAsync(DetailDepartmentDto dto);

    /// <summary>
    ///     Deletes a department
    /// </summary>
    Task<bool> DeleteDepartmentAsync(int id);
    /// <summary>
    ///     Gets a department tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id);
}