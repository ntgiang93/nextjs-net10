using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IUserRoleRepository : IGenericRepository<User, string>
{
    /// <summary>
    ///     Gets all roles for a specific user
    /// </summary>
    Task<List<UserRole>> GetAllByUserAsync(string userId);

    /// <summary>
    ///     Gets all users with a specific role
    /// </summary>
    Task<List<UserRole>> GetAllByRoleAsync(int roleId);

    /// <summary>
    ///     Adds multiple UserRole
    /// </summary>
    Task<bool> AddUserRoleAsync(IEnumerable<UserRole> userRoles);

    /// <summary>
    ///     Deletes multiple UserRole
    /// </summary>
    Task<bool> DeleteUserRoleAsync(IEnumerable<UserRole> userRoles);

    Task<UserRole> GetSingleAsync(int roleId, string userId);
    Task<bool> DeleteAsync(int roleId, string userId);
}