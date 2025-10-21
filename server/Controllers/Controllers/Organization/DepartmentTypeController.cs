using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace Controllers.Controllers.Organization;

[Route("api/organization/department-types")]
[ApiController]
[Authorize]
public class DepartmentTypeController : ControllerBase
{
    private readonly IDepartmentTypeService _departmentTypeService;
    private readonly ISysMessageService _sysMsg;

    public DepartmentTypeController(
        IDepartmentTypeService departmentTypeService,
        ISysMessageService sysMsg)
    {
        _departmentTypeService = departmentTypeService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.DepartmentType, EPermission.View)]
    public async Task<IActionResult> GetAll()
    {
        var types = await _departmentTypeService.FindAsync<DepartmentTypeDto>(x => x.IsDeleted == false);
        return Ok(ApiResponse<object>.Succeed(types, _sysMsg.Get(EMessage.SuccessMsg)));
    }


    [HttpGet("{id}")]
    [Policy(ESysModule.DepartmentType, EPermission.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var type = await _departmentTypeService.GetByIdAsync<DepartmentTypeDto>(id);
        if (type == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(type, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.DepartmentType, EPermission.Create)]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentTypeDto dto)
    {
        var newDepartmentType = await _departmentTypeService.CreateDepartmentTypeAsync(dto);
        if (newDepartmentType == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<DepartmentTypeDto>.Succeed(newDepartmentType,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.DepartmentType, EPermission.Edit)]
    public async Task<IActionResult> Update([FromBody] UpdateDepartmentTypeDto dto)
    {
        var success = await _departmentTypeService.UpdateDepartmentTypeAsync(dto);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.DepartmentType, EPermission.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _departmentTypeService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}