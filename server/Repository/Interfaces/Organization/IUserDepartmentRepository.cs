using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.Organization;

public interface IUserDepartmentRepository : IGenericRepository<UserDepartment, int>
{
    /// <summary>
    ///     Gets user's primary department
    /// </summary>
    Task<UserDepartment?> GetUserPrimaryDepartmentAsync(long userId);


    /// <summary>
    ///     Gets paginated list of user department assignments
    /// </summary>
    Task<PaginatedResultDto<DepartmentMemberDto>> GetPaginatedAsync(UserDepartmentFilterDto filter);

    Task<List<UserDepartmentDto>> GetUserDepartmentAsync(long userId);
}