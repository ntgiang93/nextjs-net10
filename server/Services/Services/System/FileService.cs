using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Http;
using MimeDetective;
using MimeDetective.Definitions;
using Common.Exceptions;
using Common.Security;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.File;
using Model.Entities.System;
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

    public FileService(
        IFileRepository fileRepository,
        IServiceProvider serviceProvider) : base(fileRepository, serviceProvider)
    {
        _fileRepository = fileRepository;
        _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(),_uploadFolder);

        // Create directory if it doesn't exist
        if (!Directory.Exists(_uploadDirectory)) Directory.CreateDirectory(_uploadDirectory);
    }

    public async Task<FileDto> UploadFileAsync(IFormFile file, FileUploadDto fileDto)
    {
        ValidateFile(file);
        var user = UserContext.Current;
        // Create container directory based on reference type or use general
        var containerName = !string.IsNullOrEmpty(fileDto.ReferenceType)
            ? Path.Combine(fileDto.ReferenceType.ToLower(), user?.UserId.ToString() ?? "general")
            : "general";

        var containerPath = Path.Combine(_uploadDirectory, containerName);
        if (!Directory.Exists(containerPath)) Directory.CreateDirectory(containerPath);

        // Generate unique file name to prevent collisions
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(containerPath, uniqueFileName);

        // Save file to disk
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create file entity
        var fileEntity = new FileStorage
        {
            FileName = file.FileName,
            FileSize = file.Length,
            MimeType = file.ContentType,
            FilePath = filePath.Replace(Directory.GetCurrentDirectory(), string.Empty),
            ReferenceId = fileDto.ReferenceId,
            ReferenceType = fileDto.ReferenceType,
            Container = containerName,
            IsPublic = fileDto.IsPublic,
            UploadedByName = UserContext.Current?.FirstName + " " + UserContext.Current?.LastName
        };

        // Save file entity to database
        var newFile = await CreateAsync(fileEntity);
        // Map to DTO
        var result = newFile.Adapt<FileDto>();
        return result;
    }

    public async Task<List<FileDto>> UploadMultipleFilesAsync(IFormFileCollection files, FileUploadDto fileDto)
    {
        var results = new List<FileDto>();

        foreach (var file in files)
        {
            var fileResult = await UploadFileAsync(file, fileDto);
            results.Add(fileResult);
        }
        return results;
    }

    public async Task<List<FileDto>> GetFilesByReferenceAsync(string referenceId, string referenceType)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetFilesByReference", referenceId, referenceType);
        var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var files = await _fileRepository.GetByReferenceAsync(referenceId, referenceType);
            return files.Adapt<List<FileDto>>();
        });
        return cachedResult;
    }

    public async Task<PaginatedResultDto<FileDto>> GetPaginatedAsync(FileFilterDto filter)
    {
        //var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPaginatedFiles", filter);
        //var cachedResult = await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        //{
        //    var paginatedResult = await GetAllAsync<FileDto>(
        //        f => f.FileName.Contains(filter.SearchTerm ?? string.Empty) && f.ReferenceType == filter.ReferenceType,
        //        filter.PageNumber, filter.PageSize, true);

        //    return new PaginatedResultDto<FileDto>
        //    {
        //        Items = paginatedResult.Items.ToList(),
        //        TotalCount = paginatedResult.TotalCount,
        //        PageIndex = filter.PageNumber,
        //        PageSize = filter.PageSize
        //    };
        //});
        //return cachedResult;
        return null;
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
        var DocInspector = new ContentInspectorBuilder
        {
            Definitions = DefaultDefinitions.FileTypes.Documents.All()
                .Concat(DefaultDefinitions.FileTypes.Images.All())
                .Concat(DefaultDefinitions.FileTypes.Text.All())
                .Concat(DefaultDefinitions.FileTypes.Archives.All())
                .ToList()
        }.Build();
        var Results = DocInspector.Inspect(file.OpenReadStream());
        var ResultsByMimeType = Results.ByFileExtension();
        if (!ResultsByMimeType.Any(match => AllowedFileTypes.Contains(match.Extension.ToLower())))
            throw new BusinessException(SysMsg.Get(EMessage.FileTypeNotAllowed), "FILE_TYPE_NOT_ALLOWED");
    }
}