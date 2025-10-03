using Microsoft.AspNetCore.Builder;

namespace Common.Security
{
    public static class JwtUserInfoMiddlewareExtensions
    {
        /// <summary>
        /// Adds the JWT user information middleware to extract user details from authenticated requests
        /// </summary>
        /// <param name="builder">The application builder</param>
        /// <returns>The application builder</returns>
        public static IApplicationBuilder UseJwtUserInfo(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtUserInfoMiddleware>();
        }
    }
}