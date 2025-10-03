using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.Security;
using Model.DTOs.System.Menu;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces.System
{
    public interface IMenuService : IGenericService<Menu, int>
    {
        /// <summary>
        /// Gets all menus as a tree structure
        /// </summary>
        Task<List<MenuDto>> GetMenuTreeAsync();

        /// <summary>
        /// Gets menus based on user permissions
        /// </summary>
        Task<List<MenuDto>> GetUserMenusAsync();

        /// <summary>
        /// Creates a new menu
        /// </summary>
        Task<MenuDto> CreateMenuAsync(CreateMenuDto dto);

        /// <summary>
        /// Updates a menu
        /// </summary>
        Task<bool> UpdateMenuAsync(UpdateMenuDto dto);
    }
}