using Model.DTOs.Base;
using Model.DTOs.System;
using Model.DTOs.System.Module;
using Model.DTOs.System.Role;
using Model.DTOs.System.User;
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
    ///     Retrieves the permissions associated with a specific role. Return role permissions without exploding from bitmask
    ///     <para>
    ///     Retrieves permissions for the specified role exactly as stored:
    ///     one entry per module where <see cref="RolePermission.Permission"/> is a combined EPermission bitmask (no flag expansion).
    ///     </para>
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of role permissions with combined bitmask per module</returns>
    Task<List<RolePermission>> GetRolePermissionAsync(int roleId);

    /// <summary>
    ///     Retrieves the permissions associated with a specific role.
    ///     <para>
    ///     Retrieves permissions for the specified role with the permission bitmask expanded into discrete flags:
    ///     returns one entry per module per atomic <see cref="EPermission"/> value (no combined flags).
    ///     </para>
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of role permissions exploded into individual EPermission flags</returns>
    Task<List<RolePermission>> GetRolePermissionExplodedAsync(int roleId);

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
    /// <param name="dto">DTO containing role ID and list of user IDs to add</param>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> AddMemberToRole(AddMemberRoleDto dto);

    /// <summary>
    ///     Gets all users assigned to a specific role
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <returns>List of role members with their details</returns>
    Task<PaginatedResultDto<RoleMembersDto>> GetRoleMembers(GetRoleMembersDto filter);
    
    /// <summary>
    ///     Removes multiple users from a specific role
    /// </summary>
    /// <param name="roleId">ID of the role</param>
    /// <param name="userIds">List of user IDs to remove from the role</param>
    /// <returns>True if removal was successful, false otherwise</returns>
    Task<bool> RemoveRoleMembers(int roleId, List<string> userIds);

    /// <summary>
    ///     Gets users not in the specified role with cursor pagination
    /// </summary>
    /// <param name="filter">Filter containing roleId, search term, cursor and limit</param>
    /// <returns>Cursor paginated list of users not in the role</returns>
    Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInRole(UserRoleCursorFilterDto filter);

}