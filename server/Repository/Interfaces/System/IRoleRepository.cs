using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IRoleRepository : IGenericRepository<Role, int>
{
    Task<List<string>> GetRolePermissionsString(string role);
    Task<List<RolePermissions>> GetRolePermissions(string role);
    Task<bool> AddRolePermissionsAsync(IEnumerable<RolePermissions> rolePermissions);
    Task<bool> DeleteRolePermissionsAsync(IEnumerable<RolePermissions> rolePermissions);
    Task<List<RoleMembersDto>> GetRoleMembersAsync(int roleId);
}