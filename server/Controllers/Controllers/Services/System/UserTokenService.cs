using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using Model.Constants;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.Base;
using Service.Interfaces;
using Service.Services.Base;

namespace Service.Services;

public class UserTokenService : GenericService<UserToken, long>, IUserTokenService
{
    private readonly AppSettings _appSettings;
    private readonly IUserService _userService;

    public UserTokenService(IUserService userService,
        AppSettings appSettings,
        IGenericRepository<UserToken, long> repository,
        IServiceProvider serviceProvider) : base(repository, serviceProvider)
    {
        _userService = userService;
        _appSettings = appSettings;
    }

    public async Task<KeyValuePair<string, string>> GenerateToken(User user)
    {
        var roles = await _userService.GetUserRoleAsync(user.Id);
        var tokenId = Guid.NewGuid().ToString();
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Jti, tokenId),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new("FullName", user.FullName),
            new("Language", DetectLanguage(user)),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.Jwt.SingingKey));
        var token = new JwtSecurityToken(
            _appSettings.Jwt.Issuer,
            _appSettings.Jwt.Audience,
            expires: DateTime.UtcNow.AddMinutes(_appSettings.Jwt.TokenExpiresIn),
            claims: claims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        if (string.IsNullOrEmpty(tokenString)) throw new Exception(SysMsg.Get(EMessage.Error500Msg));
        return new KeyValuePair<string, string>(tokenId, tokenString);
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var session = await GetSingleAsync<UserToken>(x => x.RefreshToken == refreshToken);
        if (session == null) return true;
        session.Expires = default;
        session.RefreshToken = string.Empty;
        session.IsDeleted = true;
        return await _repository.UpdateAsync(session);
    }

    public async Task<KeyValuePair<string, DateTime>> GenerateRefreshToken(User user, string deviceId, string ipAddress,
        string accessTokenId, string? device, string? deviceToken)
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        var refreshToken = Convert.ToBase64String(randomNumber);
        var userToken =
            await GetSingleAsync<UserToken>(x =>
                x.DeviceId == deviceId && x.UserId == user.Id && x.IsDeleted == false);
        if (userToken != null)
        {
            userToken.RefreshToken = refreshToken;
            userToken.Expires = DateTime.UtcNow.AddDays(_appSettings.Jwt.RefreshTokenExpiresIn);
            userToken.AccessTokenId = accessTokenId;
            userToken.IpAddress = ipAddress;
            await UpdateAsync(userToken);
        }
        else
        {
            var token = new UserToken
            {
                UserId = user.Id,
                DeviceId = deviceId,
                Device = device,
                DeviceToken = deviceToken,
                IpAddress = ipAddress,
                AccessTokenId = accessTokenId,
                RefreshToken = refreshToken,
                Expires = DateTime.UtcNow.AddDays(_appSettings.Jwt.RefreshTokenExpiresIn)
            };
            userToken = await CreateAsync(token, user.Username);
        }

        if (userToken == null) throw new Exception(SysMsg.Get(EMessage.Error500Msg));
        return new KeyValuePair<string, DateTime>(userToken.RefreshToken, userToken.Expires);
    }

    private string DetectLanguage(User user)
    {
        if (string.IsNullOrEmpty(user.Language))
        {
            var currentCulture = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
            return currentCulture;
        }

        return user.Language;
    }
}