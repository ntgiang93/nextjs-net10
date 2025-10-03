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

    public async Task<bool> AddUserRolesAsync(IEnumerable<UserRoles> userRoles)
    {
        return await _userRoleRepository.AddUserRolesAsync(userRoles);
    }

    public async Task<bool> DeleteUserRolesAsync(IEnumerable<UserRoles> userRoles)
    {
        return await _userRoleRepository.DeleteUserRolesAsync(userRoles);
    }

    public async Task<bool> UpdateUserRolesAsync(IEnumerable<UserRoles> userRoles, long userId)
    {
        var existedRole = await _userRoleRepository.GetAllByUserAsync(userId);
        if (existedRole.Any()) await DeleteUserRolesAsync(existedRole);
        return await AddUserRolesAsync(userRoles);
    }

    public async Task<List<UserRoles>> GetAllByRoleAsync(long roleId)
    {
        return await _userRoleRepository.GetAllByRoleAsync(roleId);
    }

    public async Task<List<UserRoles>> GetAllByUserAsync(long userId)
    {
        return await _userRoleRepository.GetAllByUserAsync(userId);
    }
}