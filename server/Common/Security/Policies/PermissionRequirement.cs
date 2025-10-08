using Microsoft.AspNetCore.Authorization;
using Model.DTOs.System.Module;
using Model.Entities.System;

namespace Common.Security.Policies
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public ModulePermissionDto Permission { get; }
        public PermissionRequirement(ModulePermissionDto permission) => Permission = permission;
    }
}
