using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Security;
using Common.Security.Policies;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Service.Interfaces.Base;
using Service.Interfaces.System;

namespace NextDotNet.Api.Controllers.System;

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
        if (!currentUser.Roles.Contains(DefaultRoles.SuperAdmin) &&
            !currentUser.Roles.Contains(DefaultRoles.Admin) &&
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
    [Policy(ESysModule.Users, EPermission.Creation)]
    public async Task<IActionResult> CreateUserProfile([FromBody] SaveUserProfileDto createProfileDto)
    {
        var currentUser = UserContext.Current;
        if (!currentUser.Roles.Contains(DefaultRoles.SuperAdmin) &&
            !currentUser.Roles.Contains(DefaultRoles.Admin) &&
            currentUser.UserId != createProfileDto.UserId)
            return Forbid();
        var newProfile = createProfileDto.Adapt<UserProfile>();
        var result = await _userProfileService.CreateAsync(newProfile);
        if (result != null)
            return Ok(ApiResponse<UserProfileDto>.Succeed(result.Adapt<UserProfileDto>(),
                _sysMsg.Get(EMessage.SuccessMsg)));
        return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Users, EPermission.Edition)]
    public async Task<IActionResult> UpdateUserProfile([FromBody] SaveUserProfileDto updateProfileDto)
    {
        var currentUser = UserContext.Current;
        if (!currentUser.Roles.Contains(DefaultRoles.SuperAdmin) &&
            !currentUser.Roles.Contains(DefaultRoles.Admin) &&
            currentUser.UserId != updateProfileDto.UserId)
            return Forbid();
        var profile = updateProfileDto.Adapt<UserProfile>();
        var success = await _userProfileService.UpdateAsync(profile);
        if (success)
            return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
        return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }
}