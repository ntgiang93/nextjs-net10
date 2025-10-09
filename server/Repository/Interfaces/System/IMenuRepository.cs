using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.DTOs.System.Menu;
using Model.DTOs.System.Module;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System
{
    public interface IMenuRepository : IGenericRepository<Menu, int>
    {
        /// <summary>
        /// Gets all menus and arranges them in a tree structure
        /// </summary>
        Task<List<MenuDto>> GetMenuTreeAsync();

        /// <summary>
        /// Gets menus based on user permissions
        /// </summary>
        Task<List<MenuDto>> GetMenusByPermissionsAsync(List<RolePermission> permissions);
    }
}