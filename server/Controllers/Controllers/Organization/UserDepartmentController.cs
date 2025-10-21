using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace Controllers.Controllers.Organization;

[Route("api/organization/user-department")]
[ApiController]
[Authorize]
public class UserDepartmentController : ControllerBase
{
    private readonly ISysMessageService _sysMsg;
    private readonly IUserDepartmentService _userDepartmentService;

    public UserDepartmentController(IUserDepartmentService userDepartmentService, ISysMessageService sysMsg)
    {
        _userDepartmentService = userDepartmentService;
        _sysMsg = sysMsg;
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetUserDepartmentById(int id)
    {
        var userDepartment = await _userDepartmentService.GetByIdAsync<UserDepartment>(id);
        if (userDepartment == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<UserDepartment>.Succeed(userDepartment, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("members")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetDepartmentMembers([FromBody] UserDepartmentFilterDto filter)
    {
        var members = await _userDepartmentService.GetDepartmentMembersPaginatedAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<DepartmentMemberDto>>.Succeed(members,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Department, EPermission.Delete)]
    public async Task<IActionResult> RemoveUserFromDepartment(int id)
    {
        var success = await _userDepartmentService.SoftDeleteAsync(id);
        if (!success)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }
}