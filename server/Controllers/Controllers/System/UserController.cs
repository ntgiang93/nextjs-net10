using Common.Exceptions;
using Common.Security;
using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.Auth;
using Model.DTOs.System.User;
using Model.Entities.System;
using Model.Models;
using Service.Interfaces;
using Service.Interfaces.Base;
using System.Net;

namespace NextDotNet.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ISysMessageService _sysMsg;
    private readonly IUserService _userService;
    public UserController(IUserService userService, ISysMessageService sysMsg)
    {
        _userService = userService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet("{id}")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _userService.GetDetailAsync(id);
        if (user == null) throw new NotFoundException(_sysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");
        return Ok(ApiResponse<UserDto>.Succeed(user, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("me")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetMe()
    {
        var currentUser = UserContext.Current;
        var user = await _userService.GetDetailAsync(currentUser.UserId);
        if (user == null) throw new NotFoundException(_sysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");
        return Ok(ApiResponse<UserDto>.Succeed(user, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("pagination")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetPagination([FromQuery] UserTableRequestDto filter)
    {
        var paginatedResult = await _userService.GetPaginationAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<UserTableDto>>.Succeed(paginatedResult,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("pagination-to-select")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetPaginationToSelect([FromQuery] PaginationRequest filter)
    {
        var paginatedResult = await _userService.GetPagination2SelectAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<UserSelectDto>>.Succeed(paginatedResult,
            _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("permission/{id}")]
    [Policy(ESysModule.Users, EPermission.View)]
    public async Task<IActionResult> GetPermission(string id)
    {
        var permissions = await _userService.GetUserPermissionsAsync(id);
        if (permissions == null) 
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.UserNotFound), HttpStatusCode.NotFound));

        return Ok(ApiResponse<List<RolePermission>>.Succeed(permissions, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("current/permissions")]
    public async Task<IActionResult> GetCurrentUserPermissions()
    {
        var permissions = await _userService.GetCurrentUserPermissionsAsync();
        return Ok(ApiResponse<List<RolePermission>>.Succeed(permissions, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromQuery] VerifyAccountDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var currentUser = UserContext.Current;
        var result = await _userService.VerifyEmailChangeAsync(dto);
        if (result) return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Users, EPermission.Create)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto createUserDto)
    {
        var result = await _userService.CreateUserAsync(createUserDto);
        if (result == null) return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
        return Ok(ApiResponse<string>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("{userId}/assign-roles")]
    [Policy(ESysModule.Users, EPermission.Edit)]
    public async Task<IActionResult> AssignRoles(string userId, [FromBody] List<UserRole> userRoles)
    {
        var success = await _userService.AssignRolesAsync(userId, userRoles);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Users, EPermission.Edit)]
    public async Task<IActionResult> Update([FromBody] UpdateUserDto updateUserDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var currentUser = UserContext.Current;
        var userRoles = currentUser.RoleCodes.Split(';');
        if (!userRoles.Contains(DefaultRoles.SuperAdmin) && !userRoles.Contains(DefaultRoles.Admin) &&
            !currentUser.UserId.Equals(updateUserDto.Id)) return Forbid(_sysMsg.Get(EMessage.Error403Msg));
        var result = await _userService.UpdateUserAsync(updateUserDto);
        if (result) return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    [HttpPut("{id}/change-active-status")]
    [Policy(ESysModule.Users, EPermission.Edit)]
    public async Task<IActionResult> ChangeActiveStatus(string id)
    {
        var result = await _userService.ChangeActiveStatus(id);
        if (result) return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    [HttpPut("change-email")]
    [Policy(ESysModule.Users, EPermission.Edit)]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var currentUser = UserContext.Current;
        var result = await _userService.ChangeEmailAsync(dto.NewEmail, dto.Password);
        if (result) return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }
    
    [HttpPut("{id}/avatar")]
    public async Task<IActionResult> UpdateAvatar(string id, IFormFile file)
    {
        var currentUser = UserContext.Current;
        var userRoles = currentUser.RoleCodes.Split(';');
        if (!currentUser.UserId.Equals(id)) return Forbid(_sysMsg.Get(EMessage.Error403Msg));
        var result = await _userService.UpdateAvatarAsync(file, id);
        if (result) return Ok(ApiResponse<bool>.Succeed(true, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    // DELETE methods
    // No DELETE methods currently defined
}