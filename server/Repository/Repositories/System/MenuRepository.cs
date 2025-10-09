using System.Text;
using Dapper;
using SqlKata;
using Model.Constants;
using Model.DTOs.System.Menu;
using Model.Entities.System;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using Repository.Interfaces.Base;
using Common.Extensions;
using Model.DTOs.System.Module;

namespace Repository.Repositories.System;

public class MenuRepository : GenericRepository<Menu, int>, IMenuRepository
{
    private readonly string _tableName;

    public MenuRepository(IDbConnectionFactory factory) : base(factory)
    {
        _tableName = StringHelper.GetTableName<Menu>();

    }

    public async Task<List<MenuDto>> GetMenuTreeAsync()
    {
        var query = new Query(_tableName)
            .Where(nameof(Menu.IsDeleted), false)
            .Where(nameof(Menu.IsActive), true)
            .OrderBy(nameof(Menu.ParentId), nameof(Menu.DisplayOrder));
        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var allMenus = await connection.QueryAsync<MenuDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return BuildMenuTree(allMenus.ToList());
    }

    public async Task<List<MenuDto>> GetMenusByPermissionsAsync(List<RolePermission> permissions)
    {
        var parameters = new DynamicParameters();
        parameters.Add("permissions", permissions);
        var activeModules = permissions.Select(p => p.SysModule).Distinct();
        var query = new Query(_tableName)
                    .Where(nameof(Menu.IsDeleted), false)
                    .Where(nameof(Menu.IsActive), true)
                    .Where(q => q.WhereNull(nameof(Menu.Sysmodule))
                                 .OrWhereIn(nameof(Menu.Sysmodule), activeModules))
                    .OrderBy(nameof(Menu.ParentId), nameof(Menu.DisplayOrder));
        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var allMenus = await connection.QueryAsync<MenuDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return BuildMenuTree(allMenus.ToList());
    }

    private List<MenuDto> BuildMenuTree(List<MenuDto> allMenus)
    {
        // Build tree structure
        var rootMenus = allMenus.Where(m => m.ParentId == null || m.ParentId == 0).ToList();

        // Recursive function to build menu tree
        void BuildMenuTreeRecursive(MenuDto parent)
        {
            parent.Children = allMenus
                .Where(m => m.ParentId == parent.Id)
                .OrderBy(m => m.DisplayOrder)
                .ToList();

            foreach (var child in parent.Children) 
                BuildMenuTreeRecursive(child);
        }

        // Build tree for each root menu
        foreach (var rootMenu in rootMenus) 
            BuildMenuTreeRecursive(rootMenu);
            
        return rootMenus.OrderBy(m => m.DisplayOrder).ToList();
    }
}