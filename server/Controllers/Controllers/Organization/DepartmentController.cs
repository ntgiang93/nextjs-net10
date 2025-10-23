using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.DTOs.System.User;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace Controllers.Controllers.Organization;

[Route("api/organization/departments")]
[ApiController]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly IUserDepartmentService _userDepartmentService;
    private readonly ISysMessageService _sysMsg;

    public DepartmentController(IDepartmentService departmentService, ISysMessageService sysMsg, IUserDepartmentService userDepartmentService)
    {
        _departmentService = departmentService;
        _userDepartmentService = userDepartmentService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetDepartmentTree()
    {
        var departments = await _departmentService.GetDepartmentTreeAsync();
        return Ok(ApiResponse<List<DepartmentDto>>.Succeed(departments, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("{id}/tree")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetSingleDepartmentTree(int id)
    {
        var departments = await _departmentService.GetSingleDepartmentTreeAsync(id);
        return Ok(ApiResponse<List<DepartmentDto>>.Succeed(departments, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("all")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetAllDepartments()
    {
        var departments = await _departmentService.GetAllAsync<DepartmentDto>();
        return Ok(ApiResponse<object>.Succeed(departments, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetDepartmentById(int id)
    {
        var department = await _departmentService.GetByIdAsync<DetailDepartmentDto>(id);
        if (department == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(department, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("get-members")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetDepartmentMembers([FromQuery] UserDepartmentFilterDto filter)
    {
        var members = await _userDepartmentService.GetDepartmentMembersPaginatedAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<DepartmentMemberDto>>.Succeed(members,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("users-not-in-department")]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetUserNotInDepartment([FromQuery] UserDeparmentCursorFilterDto filter)
    {
        var users = await _userDepartmentService.GetUserNotInDepartmentAsync(filter);
        return Ok(ApiResponse<CursorPaginatedResultDto<UserSelectDto, DateTime>>.Succeed(users,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Department, EPermission.Create)]
    public async Task<IActionResult> CreateDepartment([FromBody] DetailDepartmentDto createDepartmentDto)
    {
        var department = await _departmentService.CreateDepartmentAsync(createDepartmentDto);
        if (department == null)
            return  Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<DepartmentDto>.Succeed(department, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    // POST methods
    [HttpPost("add-members")]
    [Policy(ESysModule.Department, EPermission.Edit)]
    public async Task<IActionResult> AddMember([FromBody] AddMemberDepartmentDto dto)
    {
        if (dto.DepartmentId <= 0) return BadRequest(_sysMsg.Get(EMessage.Error400Msg));
        var success = await _userDepartmentService.AddMemberToDepartmentAsync(dto);
        if (!success)
            return  Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<bool>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Department, EPermission.Edit)]
    public async Task<IActionResult> UpdateDepartment([FromBody] DetailDepartmentDto updateDepartmentDto)
    {
        var success = await _departmentService.UpdateDepartmentAsync(updateDepartmentDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Department, EPermission.Delete)]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var success = await _departmentService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success,_sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpDelete("remove-member")]
    [Policy(ESysModule.Department, EPermission.Edit)]
    public async Task<IActionResult> RemoveMember([FromBody] List<int> ids)
    {
        var success = await _userDepartmentService.RemoveDepartmentMemberAsync(ids);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success,_sysMsg.Get(EMessage.SuccessMsg)));
    }
}