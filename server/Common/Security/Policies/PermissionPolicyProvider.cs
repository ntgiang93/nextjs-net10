using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

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
                builder.AddRequirements(new PermissionRequirement(policyName));
                policy = builder.Build();
            }
            return policy;
        }
    }
}
