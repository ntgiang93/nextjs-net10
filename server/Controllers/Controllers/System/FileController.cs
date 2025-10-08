using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Common.Security.Policies;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.File;
using Service.Interfaces.Base;
using Service.Interfaces.System;

namespace NextDotNet.Api.Controllers.System;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FileController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly ISysMessageService _sysMsg;

    public FileController(IFileService fileService, ISysMessageService sysMsg)
    {
        _fileService = fileService;
        _sysMsg = sysMsg;
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadFile(int id)
    {
        var (fileStream, contentType, fileName) = await _fileService.GetFileStreamAsync(id);
        return File(fileStream, contentType, fileName);
    }

    [HttpGet("reference")]
    public async Task<IActionResult> GetFilesByReference([FromQuery] string referenceId,
        [FromQuery] string referenceType)
    {
        if (string.IsNullOrEmpty(referenceId) || string.IsNullOrEmpty(referenceType))
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error422Msg)));

        var files = await _fileService.GetFilesByReferenceAsync(referenceId, referenceType);
        return Ok(ApiResponse<List<FileDto>>.Succeed(files, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet]
    [Policy(ESysModule.Files, EPermission.View)]
    public async Task<IActionResult> GetPaginated([FromQuery] FileFilterDto filter)
    {
        var result = await _fileService.GetPaginatedAsync(filter);
        return Ok(ApiResponse<PaginatedResultDto<FileDto>>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm] FileUploadDto fileDto)
    {
        var file = Request.Form.Files.Count > 0 ? Request.Form.Files[0] : null;
        if (file == null)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error422Msg)));

        var result = await _fileService.UploadFileAsync(file, fileDto);
        return Ok(ApiResponse<FileDto>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("upload/multiple")]
    public async Task<IActionResult> UploadMultipleFiles([FromForm] FileUploadDto fileDto)
    {
        var files = Request.Form.Files;
        if (files.Count == 0)
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error422Msg)));

        var results = await _fileService.UploadMultipleFilesAsync(files, fileDto);
        return Ok(ApiResponse<List<FileDto>>.Succeed(results, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // PUT methods

    // DELETE methods
    [HttpDelete("{id}")]
    [Policy(ESysModule.Files, EPermission.Delete)]
    public async Task<IActionResult> DeleteFile(int id)
    {
        var result = await _fileService.DeleteFileAsync(id);
        if (result)
            return Ok(ApiResponse<object>.Succeed(null, _sysMsg.Get(EMessage.SuccessMsg)));
        return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }
}