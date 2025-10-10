using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Model.DTOs.System.Module;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces.System;

namespace Service.Services.System
{
    public class PermissionService : IPermissionService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IMemoryCache _memoryCache;
        private readonly string CACHE_KEY_PREFIX = "Permission_";

        public PermissionService(
            IRoleRepository roleRepository,
            IMemoryCache memoryCache)
        {
            _roleRepository = roleRepository;
            _memoryCache = memoryCache;
        }

        public async Task<List<RolePermission>> GetRolePermissionAsync(int roleId)
        {
            string cacheKey = $"{CACHE_KEY_PREFIX}{roleId}";
            
            // Try to get from cache first
            if (_memoryCache.TryGetValue(cacheKey, out List<RolePermission>? permissions) && permissions != null)
            {
                return permissions;
            }

            permissions = await _roleRepository.GetRolePermission(roleId);
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetPriority(CacheItemPriority.NeverRemove);

            _memoryCache.Set(cacheKey, permissions, cacheOptions);

            return permissions;
        }

        public void InvalidateRolePermissionCache(int roleId)
        {
            string cacheKey = $"{CACHE_KEY_PREFIX}{roleId}";
            _memoryCache.Remove(cacheKey);
        }
    }
}