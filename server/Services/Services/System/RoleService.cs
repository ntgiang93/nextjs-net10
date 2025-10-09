using Common.Exceptions;
using Common.Security;
using Mapster;
using Model.Constants;
using Model.DTOs.System;
using Model.DTOs.System.UserRole;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces;
using Service.Interfaces.System;
using Service.Services.Base;

namespace Service.Services;

public class RoleService : GenericService<Role, int>, IRoleService
{
    private readonly IPermissionService _permissionService;
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRoleService _userRoleService;

    public RoleService(
        IRoleRepository repository,
        IServiceProvider serviceProvider,
        IPermissionService permissionService,
        IUserRoleService userRoleService)
        : base(repository, serviceProvider)
    {
        _roleRepository = repository;
        _permissionService = permissionService;
        _userRoleService = userRoleService;
    }

    public async Task<RoleDto?> CreateRoleAsync(RoleDto model)
    {
        // Validate role name is unique
        var existingRole = await GetRoleByCodeAsync(model.Name);
        if (existingRole != null)
            throw new BusinessException(SysMsg.Get(EMessage.RoleAlreadyExists), "ROLE_EXISTS");
        var role = model.Adapt<Role>();
        var result = await CreateAsync(role);
        return result.Adapt<RoleDto>();
    }

    public async Task<bool> UpdateRoleAsync(RoleDto roleDto)
    {
        var role = await GetByIdAsync<Role>(roleDto.Id);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");

        // Prevent modifying default roles
        if (role.IsProtected)
            throw new BusinessException(SysMsg.Get(EMessage.CannotModifyProtectedRole),
                "CANNOT_MODIFY_PROTECTED_ROLE");

        // Check if new name conflicts with existing role
        if (role.Code != roleDto.Name)
        {
            var existingRole = await GetRoleByCodeAsync(roleDto.Name);
            if (existingRole != null && existingRole.Id != roleDto.Id)
                throw new BusinessException(SysMsg.Get(EMessage.RoleAlreadyExists), "ROLE_EXISTS");
        }

        role.Description = roleDto.Description;
        return await UpdateAsync(role);
    }

    public async Task<Role> GetRoleByCodeAsync(string code)
    {
        return await _roleRepository.GetSingleAsync<Role>(r => r.Code == code);
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var role = await GetByIdAsync<Role>(id);
        if (role.IsProtected)
            throw new BusinessException(SysMsg.Get(EMessage.RoleNotFound), "CANNOT_MODIFY_PROTECTED_ROLE");

        return await SoftDeleteAsync(id);
    }

    public async Task<List<string>> GetRolePermissionStringAsync(int roleId)
    {
        var role = await GetByIdAsync<Role>(roleId);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");
        return await _roleRepository.GetRolePermissionString(role.Code);
    }

    public async Task<List<RolePermission>> GetRolePermissionAsync(int roleId)
    {
        var role = await GetByIdAsync<Role>(roleId);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");
        return await _roleRepository.GetRolePermission(role.Code);
    }

    public async Task<bool> AssignPermissionsToRoleAsync(int roleId, List<RolePermission> permissions)
    {
        var role = await GetByIdAsync<Role>(roleId);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");
        if (role.IsProtected)
            throw new BusinessException(SysMsg.Get(EMessage.CannotModifyProtectedRole), "CANNOT_MODIFY_PROTECTED_ROLE");

        // Clear existing permissions
        await _roleRepository.DeleteRolePermissionAsync(role.Code);

        var result = await _roleRepository.AddRolePermissionAsync(permissions);
        if (result) _permissionService.InvalidateRolePermissionCache(role.Code);
        return result;
    }

    public async Task<bool> AssignRoleMembers(int roleId, List<UserRole> userRoles)
    {
        var role = await GetByIdAsync<Role>(roleId);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");
        var user = UserContext.Current;
        if (!user.Roles.Contains(DefaultRoles.SuperAdmin) && role.Code == DefaultRoles.SuperAdmin)
            throw new BusinessException(SysMsg.Get(EMessage.NotPermissionModifyRole), "CANNOT_MODIFY_ROLE");

        // Clear existing permissions
        var existingUsers = await _userRoleService.GetAllByRoleAsync(roleId);
        var delList = existingUsers.Where(ur => !userRoles.Any(u => u.UserId == ur.UserId)).ToList();
        if (delList.Any()) await _userRoleService.DeleteUserRoleAsync(delList);
        var newList = userRoles.Where(ur => !existingUsers.Any(eu => eu.UserId == ur.UserId)).ToList();
        var result = await _userRoleService.AddUserRoleAsync(newList);
        CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }

    public async Task<List<RoleMembersDto>> GetRoleMembers(int roleId)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetRoleMembers", roleId);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var result = await _roleRepository.GetRoleMembersAsync(roleId);

            return result;
        });
    }
    
    public async Task<bool> RemoveRoleMember(int roleId, string userId)
    {
        var role = await  GetByIdAsync<Role>(roleId);
        if (role == null) throw new NotFoundException(SysMsg.Get(EMessage.RoleNotFound), "ROLE_NOT_FOUND");
        var user = UserContext.Current;
        if (!user.Roles.Contains(DefaultRoles.SuperAdmin) && role.Code == DefaultRoles.SuperAdmin)
            throw new BusinessException(SysMsg.Get(EMessage.NotPermissionModifyRole), "CANNOT_MODIFY_ROLE");

        var result =  await _userRoleService.DeleteAsync(roleId, userId);
        if(result) CacheManager.RemoveCacheByPrefix(_cachePrefix);
        return result;
    }
}