using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.Models;
using Service.Interfaces;
using Service.Interfaces.Base;

namespace Controllers.Controllers.System;

[Route("api/categories")]
[ApiController]
[Authorize]
public class SysCategoryController : ControllerBase
{
    private readonly ISysCategoryService _categoryService;
    private readonly ISysMessageService _sysMsg;

    public SysCategoryController(ISysCategoryService categoryService, ISysMessageService sysMsg)
    {
        _categoryService = categoryService;
        _sysMsg = sysMsg;
    }

    [HttpGet("system-modules")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public IActionResult GetAllSysModule()
    {
        var modules = SysModule.Get2SelectOptions();
        return Ok(ApiResponse<IEnumerable<SelectOption<string>>>.Succeed(modules, _sysMsg.Get(EMessage.SuccessMsg)));
    }
    
    [HttpGet("system-permissions")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public IActionResult GetAllPermission()
    {
        var permisons = Permission.Get2SelectOptions();
        return Ok(ApiResponse<IEnumerable<SelectOption<EPermission>>>.Succeed(permisons, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _categoryService.GetAllAsync<CategoryDto>();
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.Succeed(categories, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("tree")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetCategoryTree()
    {
        IEnumerable<CategoryTreeDto>? tree = await _categoryService.GetTreeAsync();
        return Ok(ApiResponse<IEnumerable<CategoryTreeDto>>.Succeed(tree, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("type/{type}")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetByType(string type)
    {
        var categories = await _categoryService.GetByTypeAsync(type);
        return Ok(ApiResponse<List<CategoryDto>>.Succeed(categories, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    [Policy(ESysModule.SysCategories, EPermission.View)]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category = await _categoryService.GetByIdAsync<CategoryDto>(id);
        if (category == null)
            return NotFound(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
        return Ok(ApiResponse<CategoryDto>.Succeed(category, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost]
    [Policy(ESysModule.SysCategories, EPermission.Create)]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryDto categoryDto)
    {
        var success = await _categoryService.CreateCategoryAsync(categoryDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPut]
    [Policy(ESysModule.SysCategories, EPermission.Edit)]
    public async Task<IActionResult> UpdateCategory([FromBody] CategoryDto categoryDto)
    {
        var success = await _categoryService.UpdateCategoryAsync(categoryDto);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpDelete("{id}")]
    [Policy(ESysModule.SysCategories, EPermission.Delete)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        if (!success)
            return Ok(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));

        return Ok(ApiResponse<object>.Succeed(null,_sysMsg.Get(EMessage.SuccessMsg)));
    }
}