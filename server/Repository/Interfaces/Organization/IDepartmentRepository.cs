using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.Organization;

public interface IDepartmentRepository : IGenericRepository<Department, int>
{
    /// <summary>
    ///     Gets all departments as a tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetDepartmentTreeAsync();
    /// <summary>
    ///     Gets a departments as a tree structure
    /// </summary>
    Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id);
}