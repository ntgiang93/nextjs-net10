using Model.Entities.System;

namespace Service.Interfaces.System
{
    public interface IPermissionService
    {
        Task<List<RolePermission>> GetRolePermissionAsync(int roleId);
        void InvalidateRolePermissionCache(int roleId);
    }
}