using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Security.Policies;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.Menu;
using Model.Entities.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace NextDotNet.Api.Controllers.Organization;

[Route("api/organization/[controller]")]
[ApiController]
[Authorize]
public class JobTitleController : ControllerBase
{
    private readonly IJobTitleService _jobTitleService;
    private readonly ISysMessageService _sysMsg;

    public JobTitleController(IJobTitleService jobTitleService, ISysMessageService sysMsg)
    {
        _jobTitleService = jobTitleService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet("{id}")]
    [Policy(ESysModule.Menu, EPermission.View)]
    public async Task<IActionResult> GetMenuById(int id)
    {
        var menu = await _jobTitleService.GetByIdAsync<MenuDto>(id);
        if (menu == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(menu, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Menu, EPermission.Creation)]
    public async Task<IActionResult> CreateMenu([FromBody] JobTitle jobTitle)
    {
        var id = await _jobTitleService.CreateAsync(jobTitle);
        if (id == 0)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<int>.Succeed(id, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Menu, EPermission.Edition)]
    public async Task<IActionResult> UpdateMenu([FromBody] JobTitle jobTitle)
    {
        var success = await _jobTitleService.UpdateAsync(jobTitle);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Menu, EPermission.Deletion)]
    public async Task<IActionResult> DeleteMenu(int id)
    {
        var success = await _jobTitleService.SoftDeleteAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }
}