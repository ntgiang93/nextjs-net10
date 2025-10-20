using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Security.Policies;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace NextDotNet.Api.Controllers.BusinessCategory;

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
    [Policy(ESysModule.BusinessCategory, EPermission.View)]
    public async Task<IActionResult> GetAll()
    {
        var types = await _departmentTypeService.FindAsync<DepartmentTypeDto>(x => x.IsDeleted == false);
        return Ok(ApiResponse<object>.Succeed(types, _sysMsg.Get(EMessage.SuccessMsg)));
    }


    [HttpGet("{id}")]
    [Policy(ESysModule.BusinessCategory, EPermission.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var type = await _departmentTypeService.GetByIdAsync<DepartmentTypeDto>(id);
        if (type == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(type, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Menu, EPermission.Create)]
    public async Task<IActionResult> CreateMenu([FromBody] CreateDepartmentTypeDto dto)
    {
        var id = await _departmentTypeService.CreateAsync(dto.Adapt<DepartmentType>());
        if (id < 1)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<DepartmentTypeDto>.Succeed(id.Adapt<DepartmentTypeDto>(),
            _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Menu, EPermission.Edit)]
    public async Task<IActionResult> UpdateMenu([FromBody] UpdateDepartmentTypeDto dto)
    {
        var success = await _departmentTypeService.UpdateAsync(dto.Adapt<DepartmentType>());
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Menu, EPermission.Delete)]
    public async Task<IActionResult> DeleteMenu(int id)
    {
        var success = await _departmentTypeService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}