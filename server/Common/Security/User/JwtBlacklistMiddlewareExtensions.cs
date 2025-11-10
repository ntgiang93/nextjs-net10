using Microsoft.AspNetCore.Builder;

namespace Common.Security.User
{
    public static class JwtBlacklistMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtBlacklist(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtBlacklistMiddleware>();
        }
    }
}