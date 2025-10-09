using Microsoft.AspNetCore.Authorization;
using Model.DTOs.System.Module;
using Model.Entities.System;

namespace Common.Security.Policies
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public RolePermission Permission { get; }
        public PermissionRequirement(RolePermission permission) => Permission = permission;
    }
}
