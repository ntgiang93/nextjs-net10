using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces;

public interface IUserTokenService : IGenericService<UserToken, long>
{
    Task<KeyValuePair<string, string>> GenerateToken(User user);

    Task<KeyValuePair<string, DateTime>> GenerateRefreshToken(User user, string deviceId, string ipAddress,
        string accessTokenId, string? device, string? deviceToken);

    Task<bool> RevokeTokenAsync(string token);
}