using Microsoft.AspNetCore.Http; 
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Caching.Memory;

namespace Common.Security.User;

public class JwtBlacklistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;

    public JwtBlacklistMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Extract and process JWT token if the user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var claim = context.User.FindFirst(JwtRegisteredClaimNames.Jti);
            string jti = claim?.Value ?? string.Empty;
            _cache.TryGetValue("BlacklistedToken_" + jti, out bool isBlacklistedToken);
            if (isBlacklistedToken)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Token has been revoked.");
                return;
            }
        }

        // Continue with the request pipeline
        await _next(context);
    }
}