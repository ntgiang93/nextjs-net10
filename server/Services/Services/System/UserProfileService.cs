using System;
using System.Threading.Tasks;
using Mapster;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces.System;
using Service.Services.Base;

namespace Service.Services.System;

public class UserProfileService : GenericService<UserProfile, string>, IUserProfileService
{
    private readonly IUserProfileRepository _userProfileRepository;

    public UserProfileService(
        IUserProfileRepository userProfileRepository,
        IServiceProvider serviceProvider) : base(userProfileRepository, serviceProvider)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var user = await _userProfileRepository.GetByUserIdAsync(userId);
        return user;
    }

    public async Task<bool> SaveUserProfile(SaveUserProfileDto dto)
    {
        var existingProfile = await _userProfileRepository.GetByIdAsync<UserProfile>(dto.Id);
        if (existingProfile == null)
        {
            var newProfile = dto.Adapt<UserProfile>();
            var result = await CreateAsync(newProfile);
            return !string.IsNullOrEmpty(result);
        }
        else
        {
            existingProfile = dto.Adapt<UserProfile>();
            return await UpdateAsync(existingProfile);
        }
    }
}