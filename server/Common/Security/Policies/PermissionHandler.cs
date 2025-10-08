using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using Model.Constants;
using Model.DTOs.System.Module;

namespace Common.Security.Policies;

public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IMemoryCache _cache;

    public PermissionHandler(IMemoryCache cache)
    {
        _cache = cache;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var roles = context.User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value);
        if (roles.Any(r => r.Equals(DefaultRoles.SuperAdmin, StringComparison.OrdinalIgnoreCase)))
            context.Succeed(requirement);
        else
            foreach (var item in roles)
            {
                var cacheKey = $"{Permission.PermissionCacheKeyPrefix}{item}";
                if (_cache.TryGetValue(cacheKey, out List<ModulePermissionDto> permissions))
                    if (permissions != null && permissions.Contains(requirement.Permission))
                    {
                        context.Succeed(requirement);
                        return;
                    }
            }

        await Task.CompletedTask;
    }
}