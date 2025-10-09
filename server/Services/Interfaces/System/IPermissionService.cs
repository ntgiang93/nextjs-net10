using Model.Entities.System;

namespace Service.Interfaces.System
{
    public interface IPermissionService
    {
        Task<List<RolePermission>> GetRolePermissionAsync(string role);
        void InvalidateRolePermissionCache(string role);
    }
}