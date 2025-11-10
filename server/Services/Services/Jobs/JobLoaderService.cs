using Microsoft.Extensions.Hosting;
using Quartz;
using Quartz.Spi;
using Repository.Interfaces.System;
using Serilog;

namespace Services.Services.Jobs;

public class JobLoaderService : IHostedService
{
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly IJobConfigurationRepository _configRepository;
    private readonly IJobFactory _jobFactory;

    public JobLoaderService(ISchedulerFactory schedulerFactory, IJobConfigurationRepository configRepository,
        IJobFactory jobFactory
    )
    {
        _schedulerFactory = schedulerFactory;
        _configRepository = configRepository;
        _jobFactory = jobFactory;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        scheduler.JobFactory = _jobFactory;
        var jobs = await _configRepository.GetActiveJobsAsync();

        foreach (var jobConfig in jobs)
        {
            try
            {
                var jobKey = new JobKey(jobConfig.JobName, jobConfig.JobGroup);

                if (await scheduler.CheckExists(jobKey))
                    continue;

                // Dùng reflection để lấy kiểu job
                var jobType = Type.GetType(jobConfig.JobType);
                if (jobType == null)
                {
                    Log.Warning($"Không tìm thấy job type: {jobConfig.JobType}");
                    continue;
                }

                var job = JobBuilder.Create(jobType)
                    .WithIdentity(jobKey)
                    .WithDescription(jobConfig.Description)
                    .Build();

                var trigger = TriggerBuilder.Create()
                    .WithIdentity($"{jobConfig.JobName}_trigger", jobConfig.JobGroup)
                    .WithCronSchedule(jobConfig.CronExpression)
                    .StartNow()
                    .Build();

                await scheduler.ScheduleJob(job, trigger, cancellationToken);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        await scheduler.Start(cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        if (scheduler is not null)
            await scheduler.Shutdown(cancellationToken);
    }
}