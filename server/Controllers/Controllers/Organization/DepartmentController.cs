using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace NextDotNet.Api.Controllers.Department;

[Route("api/organization/department")]
[ApiController]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ISysMessageService _sysMsg;

    public DepartmentController(IDepartmentService departmentService, ISysMessageService sysMsg)
    {
        _departmentService = departmentService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.Department, EPermission.View)]
    public async Task<IActionResult> GetDepartmentTree()
    {
        var departments = await _departmentService.GetDepartmentTreeAsync();
        return Ok(ApiResponse<List<TableDepartmentDto>>.Succeed(departments, _sysMsg.Get(EMessage.SuccessMsg)));
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
        var department = await _departmentService.GetByIdAsync<DepartmentDto>(id);
        if (department == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(department, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Department, EPermission.Create)]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto createDepartmentDto)
    {
        var department = await _departmentService.CreateDepartmentAsync(createDepartmentDto);
        if (department == null)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<DepartmentDto>.Succeed(department, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Department, EPermission.Edit)]
    public async Task<IActionResult> UpdateDepartment([FromBody] UpdateDepartmentDto updateDepartmentDto)
    {
        var success = await _departmentService.UpdateDepartmentAsync(updateDepartmentDto);
        if (!success)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Department, EPermission.Delete)]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var success = await _departmentService.SoftDeleteAsync(id);
        if (!success)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }
}