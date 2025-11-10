using Microsoft.Extensions.Hosting;
using Quartz;
using Quartz.Spi;
using Repository.Interfaces.System;
using Serilog;

namespace Services.Services.Jobs;

public class JobLoader : IHostedService
{
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly IJobConfigurationRepository _configRepository;
    private IScheduler _scheduler;
    private readonly IJobFactory _jobFactory;

    public JobLoader(ISchedulerFactory schedulerFactory, IJobConfigurationRepository configRepository,
        IScheduler scheduler,
        IJobFactory jobFactory
    )
    {
        _schedulerFactory = schedulerFactory;
        _configRepository = configRepository;
        _scheduler = scheduler;
        _jobFactory = jobFactory;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        _scheduler.JobFactory = _jobFactory;
        var jobs = await _configRepository.GetActiveJobsAsync();

        foreach (var jobConfig in jobs)
        {
            var jobKey = new JobKey(jobConfig.JobName, jobConfig.JobGroup);

            if (await _scheduler.CheckExists(jobKey))
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

            await _scheduler.ScheduleJob(job, trigger, cancellationToken);
        }

        await _scheduler.Start(cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_scheduler != null)
            await _scheduler.Shutdown(cancellationToken);
    }
}