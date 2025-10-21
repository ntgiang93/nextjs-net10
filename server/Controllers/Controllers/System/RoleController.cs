using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Service.Interfaces;
using Service.Interfaces.Base;

namespace Controllers.Controllers.System;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ISysMessageService _sysMsg;

    public RoleController(IRoleService roleService, ISysMessageService sysMsg)
    {
        _roleService = roleService;
        _sysMsg = sysMsg;
    }

    [HttpGet]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _roleService.FindAsync<RoleViewDto>(r => r.IsDeleted == false);
        return Ok(ApiResponse<IEnumerable<RoleViewDto>>.Succeed(roles, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> GetRoleById(int id)
    {
        var role = await _roleService.GetByIdAsync<RoleViewDto>(id);
        if (role == null)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<RoleViewDto>.Succeed(role, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{roleId}/get-members")]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> GetRoleMembers(int roleId)
    {
        var result = await _roleService.GetRoleMembers(roleId);
        if (result == null)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<List<RoleMembersDto>>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{roleId}/permissions")]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> GetRolePermissions(int roleId)
    {
        var permissions = await _roleService.GetRolePermissionExplodedAsync(roleId);
        return Ok(ApiResponse<List<RolePermission>>.Succeed(permissions, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost]
    [Policy(ESysModule.Roles, EPermission.Create)]
    public async Task<IActionResult> CreateRole([FromBody] RoleDto roleDto)
    {
        var createdRole = await _roleService.CreateRoleAsync(roleDto);
        if (createdRole == null)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<RoleDto>.Succeed(createdRole, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("{roleId}/permissions")]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> AssignRolePermissions(int roleId, [FromBody] List<RolePermission> permissionsDto)
    {
        var success = await _roleService.AssignPermissionsToRoleAsync(roleId, permissionsDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("{roleId}/assign-members")]
    [Policy(ESysModule.Roles, EPermission.View)]
    public async Task<IActionResult> AssignRoleMembers(int roleId, [FromBody] List<UserRole> userRoles)
    {
        var success = await _roleService.AssignRoleMembers(roleId, userRoles);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPut]
    [Policy(ESysModule.Roles, EPermission.Edit)]
    public async Task<IActionResult> UpdateRole([FromBody] RoleDto roleDto)
    {
        var success = await _roleService.UpdateRoleAsync(roleDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpDelete("{id}")]
    [Policy(ESysModule.Roles, EPermission.Delete)]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var success = await _roleService.DeleteRoleAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }
    [HttpDelete("{id}/remove-member/{userId}")]
    [Policy(ESysModule.Roles, EPermission.Delete)]
    public async Task<IActionResult> DeleteRole(int id, string userId)
    {
        var success = await _roleService.RemoveRoleMember(id, userId);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}