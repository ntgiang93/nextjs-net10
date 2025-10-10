using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using Model.Constants;
using Model.Entities.System;

namespace Common.Security.Policies;

public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IMemoryCache _cache;

    public PermissionHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Lấy RoleCode (chuỗi; phân tách bằng ';')
        var roleCodeRaw = context.User.FindFirst("RoleCode")?.Value;
        if (string.IsNullOrWhiteSpace(roleCodeRaw))
            return Task.CompletedTask;

        var roleCodes = roleCodeRaw
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // SuperAdmin: bypass
        if (roleCodes.Contains(DefaultRoles.SuperAdmin))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Lấy danh sách roleId (mỗi claim là 1 role id)
        var roleIds = context.User.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .ToHashSet(StringComparer.Ordinal);

        var requiredModule = requirement.Permission.SysModule;
        var requiredPerm = requirement.Permission.Permission; // EPermission bitmask

        // Helper: kiểm tra quyền theo danh sách RolePermission từ cache
        bool HasRequired(IEnumerable<RolePermission> list)
        {
            // Tìm theo module
            var rp = list.FirstOrDefault(x =>
                string.Equals(x.SysModule, requiredModule, StringComparison.OrdinalIgnoreCase));

            if (rp is null) return false;

            var mask = rp.Permission;
            // (mask & requiredPerm) == requiredPerm hoặc có Full quyền (All)
            return ((mask & requiredPerm) == requiredPerm) || (mask & EPermission.All) == EPermission.All;
        }

        // 1) Thử theo roleId với key cache: Permission.PermissionCacheKeyPrefix + roleId
        foreach (var roleId in roleIds)
        {
            var cacheKey = $"{Permission.PermissionCacheKeyPrefix}{roleId}";
            if (_cache.TryGetValue(cacheKey, out List<RolePermission>? cachedById) && cachedById is not null)
            {
                if (HasRequired(cachedById))
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }
        }

        // 2) Nếu hệ thống cache theo roleCode, thử tiếp
        foreach (var roleCode in roleCodes)
        {
            var cacheKey = $"{Permission.PermissionCacheKeyPrefix}{roleCode}";
            if (_cache.TryGetValue(cacheKey, out List<RolePermission>? cachedByCode) && cachedByCode is not null)
            {
                if (HasRequired(cachedByCode))
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }
        }

        return Task.CompletedTask;
    }
}