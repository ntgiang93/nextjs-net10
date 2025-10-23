using System;
using System.Threading.Tasks;
using Model.DTOs.System.UserProfile;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile, string>
    {
        Task<UserProfileDto?> GetByUserIdAsync(string userId);
    }
}