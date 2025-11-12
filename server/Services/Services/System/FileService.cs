using Mapster;
using Microsoft.AspNetCore.Http;
using MimeDetective;
using MimeDetective.Definitions;
using Common.Exceptions;
using Common.Extensions;
using Common.Security;
using Common.Security.User;
using Model.Constants;
using Model.DTOs.System.File;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Service.Interfaces.System;
using Service.Services.Base;
using Serilog;

namespace Service.Services.System;

public class FileService : GenericService<FileStorage, int>, IFileService
{
    private static readonly HashSet<string> AllowedFileTypes = new()
    {
        "doc", "docx", "dwg", "pdf", "ppt", "pptx", "rtf", "xls", "xlsx", "txt", "zip", "rar", "jpg", "jpeg", "png",
        "gif", "bmp", "tiff"
    };

    private readonly IFileRepository _fileRepository;
    private readonly long _maxFileSize = 32 * 1024 * 1024;
    private readonly string _uploadDirectory;
    private readonly string _uploadFolder = "uploads";
    private readonly AppSettings _appSettings;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _domain;
    
    public FileService(
        IFileRepository fileRepository,
        IServiceProvider serviceProvider,
        AppSettings appSettings,
        IHttpContextAccessor httpContextAccessor) : base(fileRepository, serviceProvider)
    {
        _fileRepository = fileRepository;
        _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(),_uploadFolder);
        _appSettings = appSettings;
        _httpContextAccessor = httpContextAccessor;
        // Create directory if it doesn't exist
        if (!Directory.Exists(_uploadDirectory)) Directory.CreateDirectory(_uploadDirectory);
        _domain = HttpContextExtensions.GetAppDomain(httpContextAccessor, appSettings);
    }

    public async Task<FileDto> UploadFileAsync(FileUploadDto fileDto)
    {
        ValidateFile(fileDto.File);
        var user = UserContext.Current;
        // Create container directory based on reference type or use general
        var containerName = !string.IsNullOrEmpty(fileDto.ReferenceType)
            ? Path.Combine(fileDto.ReferenceType.ToLower(), user?.UserId.ToString() ?? "general")
            : "general";

        var containerPath = Path.Combine(_uploadDirectory, containerName);
        if (!Directory.Exists(containerPath)) Directory.CreateDirectory(containerPath);
        // Generate unique file name to prevent collisions
        string extension = fileDto.File.FileName.Split('.').Last();
        var uniqueFileName = $"{Ulid.NewUlid()}.{extension}";
        var filePath = Path.Combine(containerPath, uniqueFileName);

        // Save file to disk
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileDto.File.CopyToAsync(stream);
        }

        // Create file entity
        var fileEntity = new FileStorage
        {
            FileName = fileDto.File.FileName,
            FileSize = fileDto.File.Length,
            MimeType = fileDto.File.ContentType,
            FilePath = filePath.Replace(Directory.GetCurrentDirectory(), string.Empty),
            ReferenceId = fileDto.ReferenceId,
            ReferenceType = fileDto.ReferenceType,
            Container = containerName,
            IsPublic = fileDto.IsPublic,
        };

        // Save file entity to database
        var id = await CreateAsync(fileEntity);
        var newFile = await GetByIdAsync<FileStorage>(id);
        // Map to DTO
        var result = newFile.Adapt<FileDto>();
        result.FilePath = $"{_domain}{newFile.FilePath.Replace("\\", "/")}";
        return result;
    }

    public async Task<List<FileDto>> UploadMultipleFilesAsync(IFormFileCollection files, FileUploadDto fileDto)
    {
        var results = new List<FileDto>();

        foreach (var file in files)
        {
            var fileResult = await UploadFileAsync(fileDto);
            results.Add(fileResult);
        }
        return results;
    }

    public async Task<List<FileDto>> GetFilesByReferenceAsync(string referenceId, string referenceType)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetFilesByReference", referenceId, referenceType);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            
            var files = await _fileRepository.GetByReferenceAsync(referenceId, referenceType, _domain);
            return files.Adapt<List<FileDto>>();
        });
        return cachedResult;
    }

    public async Task<bool> DeleteFileAsync(int id)
    {
        var file = await GetByIdAsync<FileStorage>(id);
        if (file == null || file.IsDeleted)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "FILE_NOT_FOUND");
        try
        {
            // Delete physical file if exists
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), file.FilePath);
            if (File.Exists(file.FilePath)) File.Delete(fullPath);
            return await SoftDeleteAsync(file.Id);
        }
        catch (Exception)
        {
            Log.Error($"Error deleting file {file.FileName}: {file.FilePath}");
            throw new BusinessException(SysMsg.Get(EMessage.FileDeleteError), "FILE_DELETE_ERROR");
        }
    }
    
    public async Task<bool> DeleteFileByPathAsync(string filePath)
    {
        var file = await GetSingleAsync<FileStorage>(f => f.FilePath == filePath);
        if (file == null || file.IsDeleted)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "FILE_NOT_FOUND");
        try
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), file.FilePath);
            if (File.Exists(file.FilePath)) File.Delete(fullPath);
            return await SoftDeleteAsync(file.Id);
        }
        catch (Exception)
        {
            Log.Error($"Error deleting file {file.FileName}: {file.FilePath}");
            throw new BusinessException(SysMsg.Get(EMessage.FileDeleteError), "FILE_DELETE_ERROR");
        }
    }

    public async Task<bool> DeleteFileByReference(string referenceType, string referenceId)
    {
        var file = await GetSingleAsync<FileStorage>(f => f.ReferenceType == referenceType && f.ReferenceId == referenceId);
        if (file == null || file.IsDeleted) return true;
        try
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), file.FilePath);
            if (File.Exists(file.FilePath)) File.Delete(fullPath);
            return await SoftDeleteAsync(file.Id);
        }
        catch (Exception)
        {
            Log.Error($"Error deleting file {file.FileName}: {file.FilePath}");
            throw new BusinessException(SysMsg.Get(EMessage.FileDeleteError), "FILE_DELETE_ERROR");
        }
    }

    public Task<bool> UpdateFileRefenrenceAsync(FileUpdateRefenrenceDto dto)
    {
        var result = _fileRepository.UpdateReferenceBatch(dto.Ids,dto.ReferenceId, dto.ReferenceType);
        return result;
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(int id)
    {
        var file = await GetByIdAsync<FileStorage>(id);
        if (file == null || file.IsDeleted)
            throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "FILE_NOT_FOUND");

        if (!File.Exists(file.FilePath))
            throw new BusinessException(SysMsg.Get(EMessage.Error404Msg), "FILE_NOT_EXIST_ON_DISK");

        var stream = new FileStream(file.FilePath, FileMode.Open, FileAccess.Read);
        return (stream, file.MimeType, file.FileName);
    }

    private void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new BusinessException(SysMsg.Get(EMessage.FileRequired), "FILE_REQUIRED");

        if (file.Length > _maxFileSize)
            throw new BusinessException(SysMsg.Get(EMessage.LimitFileSize), "FILE_SIZE_EXCEEDED");
        var docInspector = new ContentInspectorBuilder
        {
            Definitions = DefaultDefinitions.FileTypes.Documents.All()
                .Concat(DefaultDefinitions.FileTypes.Images.All())
                .Concat(DefaultDefinitions.FileTypes.Text.All())
                .Concat(DefaultDefinitions.FileTypes.Archives.All())
                .ToList()
        }.Build();
        var results = docInspector.Inspect(file.OpenReadStream());
        var resultsByMimeType = results.ByFileExtension();
        if (!resultsByMimeType.Any(match => AllowedFileTypes.Contains(match.Extension.ToLower())))
            throw new BusinessException(SysMsg.Get(EMessage.FileTypeNotAllowed), "FILE_TYPE_NOT_ALLOWED");
    }
}