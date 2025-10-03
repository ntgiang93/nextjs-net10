using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces.System
{
    public interface IPermissionService
    {
        Task<IEnumerable<string>> GetRolePermissionsStringAsync(string role);
        void InvalidateRolePermissionsCache(string role);
    }
}