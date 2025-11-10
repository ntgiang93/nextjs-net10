using Quartz;
using Serilog;

namespace Services.Jobs;

public abstract class BaseJob : IJob
{

    protected BaseJob()
    {
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var jobName = context.JobDetail.Key.Name;
        Log.Information("Job {JobName} started at {Time}", jobName, DateTime.Now);

        try
        {
            await ExecuteJob(context);
            Log.Information("Job {JobName} completed successfully at {Time}", jobName, DateTime.Now);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Job {JobName} failed at {Time}", jobName, DateTime.Now);
            throw;
        }
    }

    /// <summary>
    /// Override this method to implement job logic
    /// </summary>
    protected abstract Task ExecuteJob(IJobExecutionContext context);
}