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

    public async Task<PaginatedResultDto<DepartmentMemberDto>> GetUserNotInDepartmentAsync(int id)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserNotInDepartment", id);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey,
            async () => { return await _userDepartmentRepository.GetUserNotInDepartment(id); });
        return cachedResult;
    }
}