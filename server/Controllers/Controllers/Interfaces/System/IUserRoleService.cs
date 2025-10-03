using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Entities.System;

namespace Service.Interfaces.System;

public interface IUserRoleService
{
    Task<List<UserRoles>> GetAllByUserAsync(long userId);
    Task<List<UserRoles>> GetAllByRoleAsync(long roleId);
    Task<bool> AddUserRolesAsync(IEnumerable<UserRoles> userRoles);
    Task<bool> DeleteUserRolesAsync(IEnumerable<UserRoles> userRoles);
    Task<bool> UpdateUserRolesAsync(IEnumerable<UserRoles> userRoles, long userId);
}