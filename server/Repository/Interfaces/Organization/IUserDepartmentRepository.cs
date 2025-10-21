using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.Organization;

public interface IUserDepartmentRepository : IGenericRepository<UserDepartment, int>
{
    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetPaginatedAsync(UserDepartmentFilterDto filter);
    /// <summary>
    ///     Gets paginated list of users that are not assigned to the specified department
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetUserNotInDepartment(int id);
}