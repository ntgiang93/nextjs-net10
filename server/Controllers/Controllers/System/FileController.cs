using Common.Security.Policies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.File;
using Service.Interfaces.Base;
using Service.Interfaces.System;

namespace Controllers.Controllers.System;

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
    public async Task<IActionResult> GetFilesByReference([FromQuery] GetByReferenceDto dto)
    {
        if (string.IsNullOrEmpty(dto.ReferenceId) || string.IsNullOrEmpty(dto.ReferenceType))
            return BadRequest(ApiResponse<object>.Fail(_sysMsg.Get(EMessage.Error422Msg)));

        var files = await _fileService.GetFilesByReferenceAsync(dto.ReferenceId, dto.ReferenceType);
        return Ok(ApiResponse<List<FileDto>>.Succeed(files, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    // POST methods
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromForm] FileUploadDto fileDto)
    {
        var file = fileDto.File;

        var results = await _fileService.UploadFileAsync(fileDto);
        if (results != null)
            return Ok(ApiResponse<FileDto>.Succeed(results, _sysMsg.Get(EMessage.SuccessMsg)));
        else return Ok(ApiResponse<FileDto>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
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

    [HttpPut("update-reference")]
    public async Task<IActionResult> UploadFile([FromBody] FileUpdateRefenrenceDto dto)
    {
        if (string.IsNullOrEmpty(dto.ReferenceId) || string.IsNullOrEmpty(dto.ReferenceType))
            return BadRequest(_sysMsg.Get(EMessage.Error400Msg));
        var results = await _fileService.UpdateFileRefenrenceAsync(dto);
        if (results)
            return Ok(ApiResponse<bool>.Succeed(results, _sysMsg.Get(EMessage.SuccessMsg)));
        else return Ok(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
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