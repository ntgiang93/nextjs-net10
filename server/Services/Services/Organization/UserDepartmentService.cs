using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.Security;
using Model.DTOs.Base;
using Model.DTOs.Organization;
using Model.DTOs.System.User;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Repository.Interfaces.System;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Service.Services.Organization;

public class UserDepartmentService : GenericService<UserDepartment, int>, IUserDepartmentService
{
    private readonly IUserDepartmentRepository _userDepartmentRepository;

    public UserDepartmentService(
        IUserDepartmentRepository userDepartmentRepository,
        IServiceProvider serviceProvider) : base(userDepartmentRepository, serviceProvider)
    {
        _userDepartmentRepository = userDepartmentRepository;
    }

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetDepartmentMembersPaginatedAsync(
        UserDepartmentFilterDto filter)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPaginatedUserDepartments", filter);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetPaginatedAsync(filter); });
        return cachedResult;
    }

    public async Task<CursorPaginatedResultDto<UserSelectDto, DateTime>> GetUserNotInDepartmentAsync(UserDeparmentCursorFilterDto filter)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserNotInDepartment", filter);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetUserNotInDepartment(filter); });
        return cachedResult;
    }
    public async Task<bool> AddMemberToDepartmentAsync(AddMemberDepartmentDto dto)
    {
        var currentUser = UserContext.Current;
        var result =  await _userDepartmentRepository.AddMemberAsync(dto, currentUser.UserName);
        if(result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }
    
    public async Task<bool> RemoveDepartmentMemberAsync(List<int> ids)
    {
        var currentUser = UserContext.Current;
        var result =  await _userDepartmentRepository.RemoveMemberAsync(ids, currentUser.UserName);
        if(result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }
}