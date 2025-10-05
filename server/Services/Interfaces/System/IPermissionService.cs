using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces.System
{
    public interface IPermissionService
    {
        Task<IEnumerable<string>> GetRolePermissionStringAsync(string role);
        void InvalidateRolePermissionCache(string role);
    }
}