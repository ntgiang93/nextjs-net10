using Model.DTOs.System;
using Model.DTOs.System.Module;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces;

public interface IRoleService : IGenericService<Role, int>
{
    /// <summary>
    ///     Creates a new role
    /// </summary>
    /// <param name="model">Data for creating the new role</param>
    /// <returns>Created role or null if creation failed</returns>
    Task<RoleDto?> CreateRoleAsync(RoleDto model);

    /// <summary>
    ///     Updates an existing role if it's not a default protected role
    /// </summary>
    /// <param name="roleDto">Updated role data</param>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> UpdateRoleAsync(RoleDto roleDto);

    /// <summary>
    ///     Deletes a role if it's not a default protected role
    /// </summary>
    /// <param name="id">ID of the role to delete</param>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> DeleteRoleAsync(int id);

    /// <summary>
    ///     Gets a role by name
    /// </summary>
    /// <param name="name">Name of the role to retrieve</param>
    /// <returns>Role object if found</returns>
    Task<Role> GetRoleByCodeAsync(string code);

    /// <summary>
    ///     Retrieves the permissions associated with a specific role.
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of role permissions</returns>
    Task<List<RolePermission>> GetRolePermissionAsync(int roleId);

    /// <summary>
    ///     Retrieves the permissions associated with a specific role as strings.
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of permission strings</returns>
    Task<List<string>> GetRolePermissionStringAsync(int roleId);

    /// <summary>
    ///     Assigns a list of permissions to a specified role.
    /// </summary>
    /// <param name="roleId">ID of the role to assign permissions to</param>
    /// <param name="rolePermissions">List of permissions to assign to the role</param>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> AssignPermissionsToRoleAsync(int roleId, List<RolePermission> rolePermissions);

    /// <summary>
    ///     Adds users to a specified role
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <param name="userRoles">List of user-role relationships to add</param>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> AssignRoleMembers(int roleId, List<UserRole> userRoles);

    /// <summary>
    ///     Gets all users assigned to a specific role
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of role members with their details</returns>
    Task<List<RoleMembersDto>> GetRoleMembers(int roleId);
    
    /// <summary>
    ///     Removes a user from a specific role
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <param name="userId">ID of the user to remove from the role</param>
    /// <returns>True if removal was successful, false otherwise</returns>
    Task<bool> RemoveRoleMember(int roleId, string userId);
}