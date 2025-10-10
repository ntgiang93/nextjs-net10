using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Model.Constants;
using Model.DTOs.System.Module;
using Model.Entities.System;

namespace Common.Security.Policies
{
    public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
         : base(options)
        {
        }

        public override async Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            var policy = await base.GetPolicyAsync(policyName);
            if (policy == null)
            {
                var builder = new AuthorizationPolicyBuilder();
                var permission  = policyName.Split('.');
                builder.AddRequirements(new PermissionRequirement(new RolePermission
                {
                    SysModule = permission[0],
                    Permission = (EPermission)int.Parse(permission[1] ?? "0"),
                    RoleId = 0
                }));
                policy = builder.Build();
            }
            return policy;
        }
    }
}
