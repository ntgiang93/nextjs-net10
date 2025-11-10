using Quartz;
using Serilog;
using Services.Jobs;

public class CleanTempFilesJob: BaseJob
{

    protected override async Task ExecuteJob(IJobExecutionContext context)
    {
        await Task.Delay(1000); // Simulate cleanup work
    }
}