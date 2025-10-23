using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.DTOs.System.User;
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
    Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInDepartment(UserDeparmentCursorFilterDto filter);
    /// <summary>
    ///     Adds members to a department use transaction
    /// </summary>
    Task<bool> AddMemberAsync(AddMemberDepartmentDto dto, string createdBy);
    /// <summary>
    ///     Removes members from a department use transaction
    /// </summary>
    Task<bool> RemoveMemberAsync(List<int> ids, string updatedBy);

    
}