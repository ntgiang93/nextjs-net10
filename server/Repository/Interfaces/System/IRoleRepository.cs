using Model.DTOs.System.Module;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IRoleRepository : IGenericRepository<Role, int>
{
    Task<List<string>> GetRolePermissionString(string role);
    Task<List<RolePermission>> GetRolePermission(string role);
    Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions);
    Task<bool> DeleteRolePermissionAsync(string role);
    Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId);
}