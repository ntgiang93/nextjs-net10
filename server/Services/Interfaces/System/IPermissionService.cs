using Model.DTOs.System.Module;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces.System
{
    public interface IPermissionService
    {
        Task<List<ModulePermissionDto>> GetRolePermissionAsync(string role);
        void InvalidateRolePermissionCache(string role);
    }
}