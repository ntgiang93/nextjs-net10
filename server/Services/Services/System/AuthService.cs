using Common.Exceptions;
using Common.Extensions;
using Common.Security;
using Microsoft.Extensions.Caching.Memory;
using Model.Constants;
using Model.DTOs.System.Auth;
using Model.Entities.System;
using Model.Models;
using Service.DTOs.System.Auth;
using Service.Interfaces;
using Service.Interfaces.Base;
using System.IdentityModel.Tokens.Jwt;
using Common.Security.User;
using Newtonsoft.Json;
using RestSharp;

namespace Service.Services;

public class AuthService : IAuthService
{
    private readonly AppSettings _appSettings;
    private readonly string _blackListPrefix = "BlacklistedToken_";
    private readonly IEmailSmsService _emailSmsService;
    private readonly IMemoryCache _memCache;
    private readonly ISysMessageService _sysMsg;
    private readonly IUserService _userService;
    private readonly IUserTokenService _userTokenService;

    public AuthService(IUserService userService,
        IUserTokenService userTokenService,
        IMemoryCache memCache,
        AppSettings appSettings,
        IEmailSmsService emailSmsService,
        ISysMessageService sysMsg)
    {
        _userService = userService;
        _userTokenService = userTokenService;
        _memCache = memCache;
        _appSettings = appSettings;
        _emailSmsService = emailSmsService;
        _sysMsg = sysMsg;
    }
    
    public async Task<TokenDto?> LoginProxyAsync(LoginDto loginDto)
    {
        var dto = new MedWorkingLoginDto()
        {
            userName = loginDto.UserName,
            password = loginDto.Password
        };
        var tokenString = await LoginMedWorking(dto);
        if (!string.IsNullOrEmpty(tokenString))
        {
            var user = await _userService.GetSingleAsync<User>(u => u.UserName == loginDto.UserName);
            if (user == null) return null;
            var token = new TokenDto();
            var result = await _userTokenService.GenerateToken(user);
            token.AccessToken = result.Value;
            var refreshToken =
                await _userTokenService.GenerateRefreshToken(user, loginDto.DeviceId, loginDto.IpAddress ?? "", result.Key,
                    loginDto.Device, loginDto.DeviceToken);
            token.RefreshToken = refreshToken.Key;
            token.Expiration = refreshToken.Value;
            return token;
        }
        return null;
    }

    public async Task<TokenDto> LoginAsync(User user, LoginDto loginDto)
    {
        var token = new TokenDto();
        var result = await _userTokenService.GenerateToken(user);
        token.AccessToken = result.Value;
        var refreshToken =
            await _userTokenService.GenerateRefreshToken(user, loginDto.DeviceId, loginDto.IpAddress ?? "", result.Key,
                loginDto.Device, loginDto.DeviceToken);
        token.RefreshToken = refreshToken.Key;
        token.Expiration = refreshToken.Value;
        return token;
    }

    public async Task<TokenDto?> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var session = await _userTokenService.GetSingleAsync<UserToken>(x =>
            x.RefreshToken == dto.RefreshToken && x.Expires > DateTime.Now && x.IsDeleted == false);
        if (session == null) return null;
        var user = await _userService.GetByIdAsync<User>(session.UserId);
        var token = new TokenDto();
        var result = await _userTokenService.GenerateToken(user);
        token.AccessToken = result.Value;
        var refreshToken =
            await _userTokenService.GenerateRefreshToken(user, session.DeviceId, dto.IpAddress ?? "", result.Key, null,
                null);
        token.RefreshToken = refreshToken.Key;
        token.Expiration = refreshToken.Value;
        return token;
    }

    public async Task<bool> LogoutAsync(TokenDto tokenDto)
    {
        if (string.IsNullOrEmpty(tokenDto.AccessToken))
            return false;
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenDto.AccessToken);
        var jtiClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
        if (jtiClaim == null)
            return false;
        var tokenId = jtiClaim.Value;
        var expiration = jwtToken.ValidTo;

        var blacklistKey = _blackListPrefix + tokenId;
        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(expiration)
            .SetPriority(CacheItemPriority.Normal);
        _memCache.Set(blacklistKey, true, options);
        return await _userTokenService.RevokeTokenAsync(tokenDto.RefreshToken);
    }

    public async Task<bool> RevokeTokenAssync(List<string> deviceIds)
    {
        var user = UserContext.Current;
        foreach (var deviceId in deviceIds)
        {
            var session = await _userTokenService.GetSingleAsync<UserToken>(x =>
                x.UserId == user.UserId && x.Device == deviceId);
            if (session != null)
            {
                if (!string.IsNullOrEmpty(session.AccessTokenId))
                {
                    var blacklistKey = _blackListPrefix + session.AccessTokenId;
                    var options = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
                        .SetPriority(CacheItemPriority.Normal);
                    _memCache.Set(blacklistKey, true, options);
                }

                // Mark refresh token as revoked in database
                session.IsDeleted = true;
                session.Expires = default;
                await _userTokenService.UpdateAsync(session);
            }
        }

        return true;
    }

    public async Task<(User User, string? VerificationId)> RegisterAsync(RegisterUserDto registerDto)
    {
        await ValidateRegister(registerDto);
        // Create new user (initially inactive until verified)
        var newUser = new User
        {
            UserName = registerDto.UserName,
            Email = registerDto.Email,
            PasswordHash = PasswordHelper.HashPassword(registerDto.Password),
            Phone = registerDto.PhoneNumber,
            IsActive = _appSettings.VerificationType == VerificationType.None
        };
        var id = await _userService.CreateAsync(newUser);
        if (_appSettings.VerificationType == VerificationType.None) return (newUser, null);

        var verificationData = new VerificationCacheData(
            Random.Shared.Next(100000, 999999).ToString(),
            registerDto.Email,
            registerDto.PhoneNumber ?? "",
            newUser.Id
        );
        var verificationId = Guid.NewGuid().ToString();

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
            .SetPriority(CacheItemPriority.Normal);
        _memCache.Set(verificationId, verificationData, options);

        if (_appSettings.VerificationType == VerificationType.Email)
            SendVerifyEmail(verificationData.Code, 30, registerDto.Email);
        else if (_appSettings.VerificationType == VerificationType.Sms)
            SendVerifySms(registerDto.PhoneNumber, verificationData.Code);
        return (newUser, verificationId);
    }

    public async Task<bool> VerifyAccountAsync(VerifyAccountDto dto)
    {
        _memCache.TryGetValue(dto.VerificationId, out VerificationCacheData? data);
        if (string.IsNullOrEmpty(data?.Code))
            throw new BusinessException(_sysMsg.Get(EMessage.TokenInvalid));
        var user = await _userService.GetByIdAsync<User>(data.UserId);
        if (user == null) throw new NotFoundException(_sysMsg.Get(EMessage.Error404Msg));

        user.IsActive = true;
        if (_appSettings.VerificationType == VerificationType.Email)
            user.EmailVerified = true;
        else if (_appSettings.VerificationType == VerificationType.Sms) user.PhoneVerified = true;
        var result = await _userService.UpdateAsync(user);
        _memCache.Remove(dto.VerificationId);
        return result;
    }

    public async Task ResendVerificationAsync(string verificationId)
    {
        _memCache.TryGetValue(verificationId, out VerificationCacheData? data);
        if (!string.IsNullOrEmpty(data?.Code))
        {
            if (_appSettings.VerificationType == VerificationType.Email)
                SendVerifyEmail(data.Code, 30, data.Email);
            else if (_appSettings.VerificationType == VerificationType.Sms) SendVerifySms(data.PhoneNumber, data.Code);
        }
    }

    public async Task<bool> ChangePasswordAsync(string oldPassword, string newPassword)
    {
        var currentUser = UserContext.Current;
        var user = await _userService.GetByIdAsync<User>(currentUser.UserId);
        if (user == null)
            throw new NotFoundException(_sysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        // Verify current password
        if (!PasswordHelper.VerifyPassword(oldPassword, user.PasswordHash))
            throw new BusinessException(_sysMsg.Get(EMessage.IncorrectPassword), "INCORRECT_PASSWORD");

        // Update password
        user.PasswordHash = PasswordHelper.HashPassword(newPassword);
        var success = await _userService.UpdateAsync(user);
        if (success)
            // Revoke all tokens for this user
            await RevokeAllUserTokenAsync(user.Id);
        return success;
    }

    public async Task<bool> ResetPasswordAsync(string userId)
    {
        var user = await _userService.GetByIdAsync<User>(userId);
        if (user == null)
            throw new NotFoundException(_sysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");
        string newPassword = StringHelper.GenerateRandomString(8);

        // Update password
        user.PasswordHash = PasswordHelper.HashPassword(newPassword);
        var success = await _userService.UpdateAsync(user);
        if (success)
            // Revoke all tokens for this user
            await RevokeAllUserTokenAsync(userId);
            SendPasswordChangeEmail(newPassword, user.Email);
        return success;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userService.GetSingleAsync<User>(x => x.Email == dto.Email && x.IsActive == true && x.IsDeleted == false);
        if (user == null) return true;
        else
        {
            string newPassword = StringHelper.GenerateRandomString(8);

            // Update password
            user.PasswordHash = PasswordHelper.HashPassword(newPassword);
            var success = await _userService.UpdateAsync(user);
            if (success)
                // Revoke all tokens for this user
                await RevokeAllUserTokenAsync(user.Id);
            SendPasswordChangeEmail(newPassword, user.Email);
            return success;
        }
    }

    private async Task SendPasswordChangeEmail(string password, string toEmail)
    {
        var template = await _emailSmsService.GetEmailTemplate("ResetPassword.html");
        if (!string.IsNullOrEmpty(template))
        {
            var appName = _appSettings?.EmailConfiguration?.SMTP?.FromName ?? "App";
            var supportEmail = _appSettings?.EmailConfiguration?.SMTP?.FromEmail ?? toEmail;
            var loginUrl = ($"{_appSettings?.ClientDomain ?? string.Empty}").TrimEnd('/') + "/login";
            var body = template
                .Replace("{{AppName}}", appName)
                .Replace("{{UserName}}", toEmail)
                .Replace("{{NewPassword}}", password)
                .Replace("{{ActionUrl}}", loginUrl)
                .Replace("{{SupportEmail}}", supportEmail)
                .Replace("{{Year}}", DateTime.Now.Year.ToString());

            await _emailSmsService.SendSMTPEmailAsync(new EmailMessage
            {
                Subject = "Mật khẩu của bạn đã được đặt lại",
                Body = body,
                ToEmail = toEmail,
                IsHtml = true
            });
        }
    }

    private async Task ValidateRegister(RegisterUserDto registerDto)
    {
        // Validate email or phone based on verification type
        if (_appSettings.VerificationType == VerificationType.Email && string.IsNullOrEmpty(registerDto.Email))
            throw new UnprocessableEntityException(_sysMsg.Get(EMessage.Error422Msg));

        if (_appSettings.VerificationType == VerificationType.Sms && string.IsNullOrEmpty(registerDto.PhoneNumber))
            throw new UnprocessableEntityException(_sysMsg.Get(EMessage.Error422Msg));
        await _userService.ValidateUniqueUser(registerDto.Email, registerDto.PhoneNumber, registerDto.UserName);
    }

    private async Task SendVerifyEmail(string code, int expirationMinutes, string toEmail)
    {
        var template = await _emailSmsService.GetEmailTemplate("VerifyEmail.html");
        if (!string.IsNullOrEmpty(template))
        {
            var body = template.Replace("{VerificationCode}", code)
                .Replace("{ExpirationMinutes}", expirationMinutes.ToString());
            await _emailSmsService.SendSMTPEmailAsync(new EmailMessage
            {
                Subject = _sysMsg.Get(EMessage.VerifyEmailSubject),
                Body = body,
                ToEmail = toEmail,
                IsHtml = true
            });
        }
    }

    private async Task SendVerifySms(string phoneNumber, string code)
    {
        var content =
            $"Mã xác thực của bạn là: {code}. Mã có hiệu lực trong 30 phút. Không chia sẻ mã này với bất kỳ ai.";
        await _emailSmsService.SendSmsAsync(phoneNumber, content);
    }

    private async Task RevokeAllUserTokenAsync(string userId)
    {
        var sessions = await _userTokenService.FindAsync<UserToken>(x => x.UserId == userId && x.IsDeleted == false);
        await RevokeTokenAssync(sessions.Select(x => x.Device).ToList());
    }

    private async Task<string> LoginMedWorking(MedWorkingLoginDto loginDto)
    {
        var options = new RestClientOptions("https://api-medworking.medlatec.vn");
        var client = new RestClient(options);
        var request = new RestRequest("/api/account/login-web", Method.Post);
        request.AddHeader("Content-Type", "application/json");
        var body = JsonConvert.SerializeObject(loginDto);
        request.AddStringBody(body, DataFormat.Json);
        RestResponse response = await client.ExecuteAsync(request);
    
        if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
        {
            try
            {
                var j = Newtonsoft.Json.Linq.JObject.Parse(response.Content);
                // Try common paths for tokens or return a specific field if known
                var token = j.SelectToken("tokenString")?.ToString() ?? string.Empty;
                return token;
            }
            catch
            {
                // If parsing fails, return raw content
                return string.Empty;
            }
        }
        return string.Empty;
    }
}