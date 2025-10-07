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

namespace Repository.Repositories.System;

public class MenuRepository : GenericRepository<Menu, int>, IMenuRepository
{
    private readonly StringBuilder _sqlBuilder;
    private readonly string _tableName;

    public MenuRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
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

    public async Task<List<MenuDto>> GetMenusByPermissionsAsync(List<string> permissions)
    {
        var parameters = new DynamicParameters();
        parameters.Add("permissions", permissions);

        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT * FROM {_tableName} 
            WHERE {nameof(Menu.IsDeleted)} = 0 AND {nameof(Menu.IsActive)} = 1 
            AND ({nameof(Menu.Sysmodule)} IS NULL OR CONCAT({nameof(Menu.Sysmodule)}, '.', @viewPermission) IN @permissions)
            ORDER BY {nameof(Menu.ParentId)}, {nameof(Menu.DisplayOrder)}");

        parameters.Add("viewPermission", nameof(EPermission.View));

        var connection = _dbFactory.Connection;
        var allMenus = await connection.QueryAsync<MenuDto>(_sqlBuilder.ToString(), parameters);
        
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