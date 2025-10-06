using System;
using System.Threading.Tasks;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces.System;
using Service.Services.Base;

namespace Service.Services.System;

public class UserProfileService : GenericService<UserProfile, long>, IUserProfileService
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
        var user = await GetSingleAsync<UserProfileDto>(up => up.UserId == userId);
        return user;
    }
}