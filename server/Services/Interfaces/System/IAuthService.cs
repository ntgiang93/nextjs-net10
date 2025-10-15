using Common.Exceptions;
using Common.Security;
using Model.Constants;
using Model.DTOs.System.Auth;
using Model.Entities.System;
using Service.DTOs.System.Auth;
using Service.Services.System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces;

public interface IAuthService
{
    Task<TokenDto> LoginAsync(User user, LoginDto loginDto);
    Task<TokenDto?> RefreshTokenAsync(RefreshTokenDto dto);
    Task<bool> LogoutAsync(TokenDto tokenDto);
    Task<bool> RevokeTokenAssync(List<string> deviceIds);
    Task<(User User, string? VerificationId)> RegisterAsync(RegisterUserDto registerDto);
    Task<bool> VerifyAccountAsync(VerifyAccountDto dto);
    Task ResendVerificationAsync(string verificationId);
    Task<bool> ChangePasswordAsync(string oldPassword, string newpPassword);
    Task<bool> ResetPasswordAsync(string userId);
}