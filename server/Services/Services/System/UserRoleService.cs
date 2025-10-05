using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces.System;

namespace Service.Services.System;

public class UserRoleService : IUserRoleService
{
    private readonly IUserRoleRepository _userRoleRepository;

    public UserRoleService(IUserRoleRepository userRoleRepository)
    {
        _userRoleRepository = userRoleRepository;
    }

    public async Task<bool> AddUserRoleAsync(IEnumerable<UserRole> userRoles)
    {
        return await _userRoleRepository.AddUserRoleAsync(userRoles);
    }

    public async Task<bool> DeleteUserRoleAsync(IEnumerable<UserRole> userRoles)
    {
        return await _userRoleRepository.DeleteUserRoleAsync(userRoles);
    }

    public async Task<bool> UpdateUserRoleAsync(IEnumerable<UserRole> userRoles, string userId)
    {
        var existedRole = await _userRoleRepository.GetAllByUserAsync(userId);
        if (existedRole.Any()) await DeleteUserRoleAsync(existedRole);
        return await AddUserRoleAsync(userRoles);
    }

    public async Task<List<UserRole>> GetAllByRoleAsync(int roleId)
    {
        return await _userRoleRepository.GetAllByRoleAsync(roleId);
    }

    public async Task<List<UserRole>> GetAllByUserAsync(string userId)
    {
        return await _userRoleRepository.GetAllByUserAsync(userId);
    }
}