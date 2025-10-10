using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IRoleRepository : IGenericRepository<Role, int>
{
    Task<List<RolePermission>> GetRolePermission(int roleId);
    Task<bool> AddRolePermissionAsync(IEnumerable<RolePermission> rolePermissions);
    Task<bool> DeleteRolePermissionAsync(int roleId);
    Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId);
}