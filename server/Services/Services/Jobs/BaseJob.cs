using Microsoft.Extensions.Logging;
using Quartz;

namespace Services.Services.Jobs;

public abstract class BaseJob<T> : IJob
{
    protected readonly ILogger<T> Logger;
    protected BaseJob(ILogger<T> logger)
    {
        Logger = logger;
    }
    
    protected void LogInfo(string message, params object[] args)
    {
        using (Serilog.Context.LogContext.PushProperty("JobName", typeof(T).Name))
        {
            Logger.LogInformation(message, args);
        }
    }
    
    protected void LogWarning(string message, params object[] args)
    {
        using (Serilog.Context.LogContext.PushProperty("JobName", typeof(T).Name))
        {
            Logger.LogWarning(message, args);
        }
    }
    
    protected void LogError(Exception ex,string message, params object[] args)
    {
        using (Serilog.Context.LogContext.PushProperty("JobName", typeof(T).Name))
        {
            Logger.LogError(ex,message, args);
        }
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var jobName = context.JobDetail.Key.Name;
        LogInfo("Job {JobName} started at {Time}", jobName, DateTime.Now);
        try
        {
            await ExecuteJob(context);
            LogInfo("Job {JobName} completed successfully at {Time}", jobName, DateTime.Now);
        }
        catch (Exception ex)
        {
            LogError(ex, "Job {JobName} failed at {Time}", jobName, DateTime.Now);
            throw;
        }
    }

    /// <summary>
    /// Override this method to implement job logic
    /// </summary>
    protected abstract Task ExecuteJob(IJobExecutionContext context);
}