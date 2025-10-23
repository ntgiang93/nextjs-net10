using Common.Security;
using Common.Security.Policies;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Service.Interfaces.Base;
using Service.Interfaces.System;

namespace Controllers.Controllers.System;

[Route("api/user-profile")]
[ApiController]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly ISysMessageService _sysMsg;
    private readonly IUserProfileService _userProfileService;

    public UserProfileController(IUserProfileService userProfileService, ISysMessageService sysMsg)
    {
        _userProfileService = userProfileService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet("{userId}")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetUserProfile(string userId)
    {
        var currentUser = UserContext.Current;
        if (!currentUser.RoleCodes.Split(';').Contains(DefaultRoles.SuperAdmin) &&
            currentUser.UserId != userId)
            return Forbid();

        var profile = await _userProfileService.GetUserProfileAsync(userId);
        return Ok(ApiResponse<UserProfileDto>.Succeed(profile, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyProfile()
    {
        var currentUserId = UserContext.Current.UserId;
        var profile = await _userProfileService.GetUserProfileAsync(currentUserId);
        if (profile == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
        return Ok(ApiResponse<object>.Succeed(profile, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPost]
    [Policy(ESysModule.Users, EPermission.Create)]
    public async Task<IActionResult> CreateUserProfile([FromBody] SaveUserProfileDto dto)
    {
        var currentUser = UserContext.Current;
        if (!currentUser.RoleCodes.Split(';').Contains(DefaultRoles.SuperAdmin) &&
            !currentUser.RoleCodes.Split(';').Contains(DefaultRoles.Admin) &&
            currentUser.UserId != dto.Id)
            return Forbid();
        var result = await _userProfileService.SaveUserProfile(dto);
        if (result)
            return Ok(ApiResponse<bool>.Succeed(result,
                _sysMsg.Get(EMessage.SuccessMsg)));
        return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }
    
}