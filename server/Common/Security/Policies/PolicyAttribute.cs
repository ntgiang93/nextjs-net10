using Microsoft.AspNetCore.Authorization;
using Model.Constants;

namespace Common.Security.Policies;

[AttributeUsage(AttributeTargets.Method)]
public class PolicyAttribute : AuthorizeAttribute
{
    public PolicyAttribute(ESysModule module, EPermission permission)
    {
        var moduleName = module.ToString();
        var permissionName = permission.ToString();
        Policy = $"{moduleName}.{permissionName}";
    }
}