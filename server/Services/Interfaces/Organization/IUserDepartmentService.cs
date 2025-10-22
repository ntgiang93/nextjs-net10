using System.Collections.Generic;
using System.Threading.Tasks;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.DTOs.System.User;
using Model.Entities.Organization;
using Service.Interfaces.Base;

namespace Service.Interfaces.Organization;

public interface IUserDepartmentService : IGenericService<UserDepartment, int>
{
    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(UserDepartmentFilterDto filter);
    
    /// <summary>
    ///     Gets cursor-paginated list of users that are not assigned to the specified department
    /// </summary>
    Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInDepartmentAsync(UserDeparmentCursorFilterDto filter);
    /// <summary>
    ///     Adds members to a department
    /// </summary>
    Task<bool> AddMemberToDepartmentAsync(AddMemberDepartmentDto dto);
}