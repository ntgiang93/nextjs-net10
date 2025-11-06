using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Models;

namespace Common.Extensions;

public static class HttpContextExtensions
{
    public static string GetClientIpAddress(this HttpContext context)
    {
        // Check for forwarded headers first (for apps behind proxies/load balancers)
        var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
                 context.Request.Headers["X-Real-IP"].FirstOrDefault();

        // If no forwarded headers, use the remote IP address
        if (string.IsNullOrEmpty(ip)) ip = context.Connection.RemoteIpAddress?.ToString();

        // If multiple IPs in X-Forwarded-For, take the first one (client IP)
        if (!string.IsNullOrEmpty(ip) && ip.Contains(",")) ip = ip.Split(',')[0].Trim();

        return ip ?? "";
    }
    
    public static string GetAppDomain(IHttpContextAccessor contextAccessor, AppSettings appSettings)
    {
        // Prefer configured domain if set; else build from current request
        if (!string.IsNullOrWhiteSpace(appSettings.FileDomain))
            return appSettings.FileDomain.TrimEnd('/');

        var request = contextAccessor.HttpContext?.Request;
        string domain =  request == null
            ? string.Empty
            : $"{request.Scheme}://{request.Host.Value}";
        return NormalizeDomain(domain);
    }

    private static string NormalizeDomain(string domain)
        => domain.Trim().TrimEnd('/');

    public static string GetDevice(this HttpContext context)
    {
        // Check for device ID in headers or cookies
        var device = context.Request.Headers["User-Agent"].FirstOrDefault();

        return device ?? "";
    }
}