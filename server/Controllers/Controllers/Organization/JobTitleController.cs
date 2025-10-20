using Common.Security.Policies;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;
using Service.Interfaces.Organization;

namespace NextDotNet.Api.Controllers.Organization;

[Route("api/organization/job-titles")]
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
    [Policy(ESysModule.JobTitle, EPermission.View)]
    public async Task<IActionResult> GetById(int id)
    {
        var data = await _jobTitleService.GetSingleAsync<JobTitleDto>(x => x.IsDeleted == false && x.Id == id);
        if (data == null)
            return NotFound(ApiResponse<JobTitleDto>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<JobTitleDto>.Succeed(data, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("")]
    [Policy(ESysModule.JobTitle, EPermission.View)]
    public async Task<IActionResult> GetAll(int id)
    {
        var data = await _jobTitleService.FindAsync<JobTitleDto>(x => x.IsDeleted == false);
        if (data == null)
            return NotFound(ApiResponse<IEnumerable<JobTitleDto>>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<IEnumerable<JobTitleDto>>.Succeed(data, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Menu, EPermission.Create)]
    public async Task<IActionResult> Create([FromBody] JobTitleDto jobTitle)
    {
        var id = await _jobTitleService.CreateAsync(jobTitle.Adapt<JobTitle>());
        if (id < 1)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<int>.Succeed(id, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Menu, EPermission.Edit)]
    public async Task<IActionResult> Update([FromBody] JobTitleDto jobTitle)
    {
        var success = await _jobTitleService.UpdateAsync(jobTitle.Adapt<JobTitle>());
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Menu, EPermission.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _jobTitleService.SoftDeleteAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(success, _sysMsg.Get(EMessage.SuccessMsg)));
    }
}