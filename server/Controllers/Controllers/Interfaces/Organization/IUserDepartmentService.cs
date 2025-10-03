using System.Collections.Generic;
using System.Threading.Tasks;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;

namespace Service.Interfaces.Organization;

public interface IUserDepartmentService : IGenericService<UserDepartment, int>
{
    /// <summary>
    ///     Gets user's primary department
    /// </summary>
    Task<UserDepartment?> GetUserPrimaryDepartmentAsync(long userId);

    /// <summary>
    ///     Gets all departments for a user
    /// </summary>
    Task<List<UserDepartmentDto>> GetUserDepartmentsAsync(long userId);

    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(UserDepartmentFilterDto filter);

    /// <summary>
    ///     Creates a new user department assignment
    ///     If the assignment is marked as primary, any existing primary assignments will be updated
    /// </summary>
    Task<UserDepartment> CreateUserDepartmentAsync(UserDepartment userDepartment);

    /// <summary>
    ///     Updates a user department assignment
    ///     If the assignment is marked as primary, any existing primary assignments will be updated
    /// </summary>
    Task<bool> UpdateUserDepartmentAsync(UserDepartment userDepartment);
}