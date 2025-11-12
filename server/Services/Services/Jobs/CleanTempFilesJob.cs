using Microsoft.Extensions.Logging;
using Model.Entities.System;
using Quartz;
using Service.Interfaces.System;
using Services.Jobs;

public class CleanTempFilesJob: BaseJob<CleanTempFilesJob>
{
    private readonly IFileService _fileService;
    public CleanTempFilesJob(ILogger<CleanTempFilesJob> logger, IFileService fileService) : base(logger)
    {
        _fileService = fileService;
    }
    protected override async Task ExecuteJob(IJobExecutionContext context)
    {
        var tempFile = await _fileService.FindAsync<FileStorage>(f =>
            string.IsNullOrEmpty(f.ReferenceId) || string.IsNullOrEmpty(f.ReferenceType));
        foreach (var file in tempFile)
        {
            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                // Remove leading backslash or forward slash if exists
                var relativePath = file.FilePath.TrimStart('\\', '/');
                string path = Path.Combine(rootPath, relativePath);
                
                if(File.Exists(path))
                {
                    File.Delete(path);
                }
                await _fileService.SoftDeleteAsync(file.Id);
            }
            catch (Exception e)
            {
                LogError(e, "Error deleting temp file with ID {FileId}", file.Id);
            }
        }
    }
}