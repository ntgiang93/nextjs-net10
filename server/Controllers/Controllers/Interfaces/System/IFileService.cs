using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Model.DTOs.Base;
using Model.DTOs.System.File;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Service.Interfaces.System;

public interface IFileService : IGenericService<FileStorage, int>
{
    /// <summary>
    ///     Uploads a file to storage
    /// </summary>
    Task<FileDto> UploadFileAsync(IFormFile file, FileUploadDto fileDto);

    /// <summary>
    ///     Uploads multiple files to storage
    /// </summary>
    Task<List<FileDto>> UploadMultipleFilesAsync(IFormFileCollection files, FileUploadDto fileDto);

    /// <summary>
    ///     Gets file by reference ID and type
    /// </summary>
    Task<List<FileDto>> GetFilesByReferenceAsync(string referenceId, string referenceType);

    /// <summary>
    ///     Gets paginated list of files based on filter criteria
    /// </summary>
    Task<PaginatedResultDto<FileDto>> GetPaginatedAsync(FileFilterDto filter);

    /// <summary>
    ///     Deletes a file
    /// </summary>
    Task<bool> DeleteFileAsync(int id);

    /// <summary>
    ///     Gets file as stream
    /// </summary>
    Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(int id);
    /// <summary>
    ///     Deletes a file by its path
    /// </summary>
    Task<bool> DeleteFileByPathAsync(string filePath);
}