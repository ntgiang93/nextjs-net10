using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Repository.Interfaces.System;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Service.Services.Organization;

public class UserDepartmentService : GenericService<UserDepartment, int>, IUserDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUserDepartmentRepository _userDepartmentRepository;
    private readonly IUserRepository _userRepository;

    public UserDepartmentService(
        IUserDepartmentRepository userDepartmentRepository,
        IDepartmentRepository departmentRepository,
        IUserRepository userRepository,
        IServiceProvider serviceProvider) : base(userDepartmentRepository, serviceProvider)
    {
        _userDepartmentRepository = userDepartmentRepository;
        _departmentRepository = departmentRepository;
        _userRepository = userRepository;
    }

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(
        UserDepartmentFilterDto filter)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPaginatedUserDepartments", filter);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetPaginatedAsync(filter); });

        return cachedResult;
    }

    public async Task<UserDepartment> CreateUserDepartmentAsync(UserDepartment userDepartment)
    {
        if (userDepartment.IsPrimary) await UpdatePrimaryFlagAsync(userDepartment.UserId, userDepartment.Id);
        var result = await _userDepartmentRepository.AddAsync(userDepartment);

        return result;
    }

    public async Task<bool> UpdateUserDepartmentAsync(UserDepartment userDepartment)
    {
        if (userDepartment.IsPrimary) await UpdatePrimaryFlagAsync(userDepartment.UserId, userDepartment.Id);

        var success = await _userDepartmentRepository.UpdateAsync(userDepartment);

        return success;
    }

    public async Task<UserDepartment?> GetUserPrimaryDepartmentAsync(long userId)
    {
        return await _userDepartmentRepository.GetUserPrimaryDepartmentAsync(userId);
    }

    public async Task<List<UserDepartmentDto>> GetUserDepartmentsAsync(long userId)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserDepartments", userId);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetUserDepartmentAsync(userId); });

        return cachedResult;
    }

    private async Task UpdatePrimaryFlagAsync(long userId, int currentAssignmentId)
    {
        var primaryAssignments = await GetUserPrimaryDepartmentAsync(userId);

        if (primaryAssignments != null)
        {
            if (primaryAssignments.Id == currentAssignmentId) return;
            primaryAssignments.IsPrimary = false;
            await _userDepartmentRepository.UpdateAsync(primaryAssignments);
        }
    }
}