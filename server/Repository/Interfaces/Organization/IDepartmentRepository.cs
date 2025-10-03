using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.Organization;

public interface IDepartmentRepository : IGenericRepository<Department, int>
{
    /// <summary>
    ///     Gets all departments as a tree structure
    /// </summary>
    Task<List<TableDepartmentDto>> GetDepartmentTreeAsync();
}