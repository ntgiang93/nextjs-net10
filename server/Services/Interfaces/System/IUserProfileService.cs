using System.Threading.Tasks;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces.System;

public interface IUserProfileService : IGenericService<UserProfile, long>
{
    /// <summary>
    ///     Gets user profile
    /// </summary>
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
}