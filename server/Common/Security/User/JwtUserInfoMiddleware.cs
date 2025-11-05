using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Common.Security.User;

public class JwtUserInfoMiddleware
{
    private readonly RequestDelegate _next;

    public JwtUserInfoMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Clear the current user context to ensure fresh data
        UserContext.Clear();

        // Extract and process JWT token if the user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var roles = GetClaimValues(context.User, ClaimTypes.Role);
            var currentUser = new CurrentUser
            {
                UserId = GetClaimValue<string>(context.User, ClaimTypes.NameIdentifier),
                UserName = GetClaimValue<string>(context.User, ClaimTypes.Name),
                Language = context.Request.Cookies["USER_LOCALE"],
                Roles = roles.Select(role => int.TryParse(role, out int roleId) ? roleId : 0).ToList(),
                RoleCodes = GetClaimValue<string>(context.User, "RoleCode") ?? string.Empty
            };

            // Store the current user in the UserContext
            UserContext.Current = currentUser;
        }

        // Continue with the request pipeline
        await _next(context);
    }

    private T GetClaimValue<T>(ClaimsPrincipal user, string claimType)
    {
        var claim = user.FindFirst(claimType);
        if (claim == null) return default;

        try
        {
            if (typeof(T) == typeof(Guid) && Guid.TryParse(claim.Value, out var guidValue)) return (T)(object)guidValue;

            return (T)Convert.ChangeType(claim.Value, typeof(T));
        }
        catch
        {
            return default;
        }
    }

    private List<string> GetClaimValues(ClaimsPrincipal user, string claimType)
    {
        return user.Claims
            .Where(c => c.Type == claimType)
            .Select(c => c.Value)
            .ToList();
    }
}