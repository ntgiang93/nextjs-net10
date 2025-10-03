using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IUserRoleRepository : IGenericRepository<User, string>
{
    /// <summary>
    ///     Gets all roles for a specific user
    /// </summary>
    Task<List<UserRoles>> GetAllByUserAsync(string userId);

    /// <summary>
    ///     Gets all users with a specific role
    /// </summary>
    Task<List<UserRoles>> GetAllByRoleAsync(int roleId);

    /// <summary>
    ///     Adds multiple UserRoles
    /// </summary>
    Task<bool> AddUserRolesAsync(IEnumerable<UserRoles> userRoles);

    /// <summary>
    ///     Deletes multiple UserRoles
    /// </summary>
    Task<bool> DeleteUserRolesAsync(IEnumerable<UserRoles> userRoles);
}