using Common.Exceptions;
using Common.Security;
using Mapster;
using Model.Constants;
using Model.DTOs.System.Menu;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Interfaces.System;
using Service.Services.Base;

namespace Service.Services.System;

public class MenuService : GenericService<Menu, int>, IMenuService
{
    private readonly IMenuRepository _menuRepository;
    private readonly IPermissionService _permissionService;

    public MenuService(
        IMenuRepository menuRepository,
        IPermissionService permissionService,
        IServiceProvider serviceProvider) : base(menuRepository, serviceProvider)
    {
        _menuRepository = menuRepository;
        _permissionService = permissionService;
    }

    public async Task<List<MenuDto>> GetMenuTreeAsync()
    {
        var cacheKey = $"{_cachePrefix}GetMenuTree";
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var menuTree = await _menuRepository.GetMenuTreeAsync();
            return menuTree;
        });
    }

    public async Task<List<MenuDto>> GetUserMenusAsync()
    {
        var user = UserContext.Current;
        var userRoleCodes = user.RoleCodes.Split(';', StringSplitOptions.RemoveEmptyEntries);
        if (!user.Roles.Any()) return new List<MenuDto>();
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserMenus", user.UserId);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            if (userRoleCodes.Any(r => r == DefaultRoles.SuperAdmin))
                return await _menuRepository.GetMenuTreeAsync();
            var permissions = new List<RolePermission>();
            foreach (var role in user.Roles)
            {
                var rolePermissions = await _permissionService.GetRolePermissionAsync(role);
                permissions.AddRange(rolePermissions);
            }

            permissions = permissions.Distinct().ToList();
            var menuTree = await _menuRepository.GetMenusByPermissionsAsync(permissions);
            return menuTree;
        });
    }

    public async Task<MenuDto> CreateMenuAsync(CreateMenuDto dto)
    {
        var existUrl = await GetSingleAsync<Menu>(m => m.Url == dto.Url && m.IsDeleted == false && m.IsActive == true);
        if (existUrl != null)
            throw new BusinessException(SysMsg.Get(EMessage.MenuLinkAlreadyExists), "MENU_URL_EXISTS");

        var menu = await CreateAsync(dto.Adapt<Menu>());
        return menu.Adapt<MenuDto>();
    }

    public async Task<bool> UpdateMenuAsync(UpdateMenuDto dto)
    {
        var existUrl = await GetSingleAsync<Menu>(m =>
            m.Url == dto.Url && m.Id != dto.Id && m.IsDeleted == false && m.IsActive == true);
        if (existUrl != null)
            throw new BusinessException(SysMsg.Get(EMessage.MenuLinkAlreadyExists), "MENU_URL_EXISTS");

        var success = await UpdateAsync(dto.Adapt<Menu>());
        return success;
    }
}