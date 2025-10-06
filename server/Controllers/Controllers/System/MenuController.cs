using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Security.Policies;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.Menu;
using Service.Interfaces.Base;
using Service.Interfaces.System;

namespace NextDotNet.Api.Controllers.System;

[Route("api/menu")]
[ApiController]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;
    private readonly ISysMessageService _sysMsg;

    public MenuController(IMenuService menuService, ISysMessageService sysMsg)
    {
        _menuService = menuService;
        _sysMsg = sysMsg;
    }

    // GET methods
    [HttpGet]
    [Policy(ESysModule.Menu, EPermission.View)]
    public async Task<IActionResult> GetMenuTree()
    {
        var menus = await _menuService.GetMenuTreeAsync();
        return Ok(ApiResponse<object>.Succeed(menus, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserMenus()
    {
        var menus = await _menuService.GetUserMenusAsync();
        return Ok(ApiResponse<object>.Succeed(menus, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.Menu, EPermission.View)]
    public async Task<IActionResult> GetMenuById(int id)
    {
        var menu = await _menuService.GetByIdAsync<MenuDto>(id);
        if (menu == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<object>.Succeed(menu, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost]
    [Policy(ESysModule.Menu, EPermission.Creation)]
    public async Task<IActionResult> CreateMenu([FromBody] CreateMenuDto createMenuDto)
    {
        var menu = await _menuService.CreateMenuAsync(createMenuDto);
        if (menu == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<MenuDto>.Succeed(menu, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods
    [HttpPut]
    [Policy(ESysModule.Menu, EPermission.Edition)]
    public async Task<IActionResult> UpdateMenu([FromBody] UpdateMenuDto updateMenuDto)
    {
        var success = await _menuService.UpdateMenuAsync(updateMenuDto);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Menu, EPermission.Deletion)]
    public async Task<IActionResult> DeleteMenu(int id)
    {
        var success = await _menuService.SoftDeleteAsync(id);
        if (!success)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(_sysMsg.Get(EMessage.SuccessMsg)));
    }
}