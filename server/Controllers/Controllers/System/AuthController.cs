using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Extensions;
using Common.Security;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.Auth;
using Model.Entities.System;
using Service.DTOs.System.Auth;
using Service.Interfaces;
using Service.Interfaces.Base;

namespace NextDotNet.Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ISysMessageService _sysMsg;
    private readonly IUserService _userService;

    public AuthController(IUserService userService, ISysMessageService sysMsg,
        IAuthService authService)
    {
        _userService = userService;
        _sysMsg = sysMsg;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userService.GetSingleAsync<User>(u => u.UserName == loginDto.UserName);
        if (user == null)
            return Ok(ApiResponse<TokenDto>.Fail(_sysMsg.Get(EMessage.AuthenticationFailed)));

        var passwordIsCorrect = PasswordHelper.VerifyPassword(loginDto.Password, user.PasswordHash);
        if (!passwordIsCorrect)
            return Ok(ApiResponse<TokenDto>.Fail(_sysMsg.Get(EMessage.AuthenticationFailed)));
        loginDto.IpAddress = HttpContext.GetClientIpAddress();
        //loginDto.Device = HttpContext.GetDevice();
        var token = await _authService.LoginAsync(user, loginDto);
        if (token == null) return Unauthorized();
        setRefreshTokenCookie(token);
        return Ok(ApiResponse<TokenDto>.Succeed(token, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return BadRequest(_sysMsg.Get(EMessage.TokenInvalid));
        var dto = new RefreshTokenDto();
        dto.RefreshToken = refreshToken;
        dto.IpAddress = HttpContext.GetClientIpAddress();
        var token = await _authService.RefreshTokenAsync(dto);
        if (token == null)
            return Unauthorized();
        setRefreshTokenCookie(token);
        return Ok(ApiResponse<TokenDto>.Succeed(token, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    private void setRefreshTokenCookie(TokenDto token)
    {
        HttpContext.Response.Cookies.Append(
            "refreshToken",
            token.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                Expires = token.Expiration
            }
        );
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var tokenDto = new TokenDto();

        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            return BadRequest(_sysMsg.Get(EMessage.TokenInvalid));

        // Get the access token from the Authorization header
        if (Request.Headers.TryGetValue("Authorization", out var authHeader) &&
            !string.IsNullOrEmpty(authHeader) &&
            authHeader.ToString().StartsWith("Bearer "))
        {
            tokenDto.AccessToken = authHeader.ToString().Substring("Bearer ".Length).Trim();
            tokenDto.RefreshToken = refreshToken;
        }

        var result = await _authService.LogoutAsync(tokenDto);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenDto dto)
    {
        if (dto.DeviceIds == null || dto.DeviceIds.Count == 0)
            return BadRequest(_sysMsg.Get(EMessage.DeviceIsRequired));
        var result = await _authService.RevokeTokenAssync(dto.DeviceIds);
        if (result) return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
        return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }
}