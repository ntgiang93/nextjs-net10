using System.Reflection;
using Common.Exceptions;
using Mapster;
using Model.Constants;
using Model.DTOs.System;
using Model.Entities.System;
using Quartz;
using Quartz.Impl.Matchers;
using Repository.Interfaces.System;
using Serilog;
using Service.Interfaces.Base;
using Service.Services.Base;
using Services.Interfaces.System;
using Services.Jobs;

namespace Services.Services.Jobs
{
    public class JobScheduleService : GenericService<JobConfiguration, int>, IJobScheduleService
    {
        private readonly ISchedulerFactory _schedulerFactory;
        private readonly ISysMessageService _sysMsg;

        public JobScheduleService(ISchedulerFactory schedulerFactory, IServiceProvider serviceProvider,
            IJobConfigurationRepository configurationRepository, ISysMessageService sysMsg) : base(configurationRepository, serviceProvider)
        {
            _schedulerFactory = schedulerFactory;
            _sysMsg = sysMsg;
        }

        private async Task<IScheduler> GetSchedulerAsync() => await _schedulerFactory.GetScheduler();
        public async Task<IEnumerable<JobScheduleDto>> GetAllJobsAsync()
        {
            var jobConfigs = await GetAllAsync<JobConfiguration>();
            var scheduler = await GetSchedulerAsync();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());

            var jobs = new List<JobScheduleDto>();

            foreach (var config  in jobConfigs)
            {
                var job = config.Adapt<JobScheduleDto>();
                var jobKey = jobKeys.FirstOrDefault(x => x.Name == config.JobName);
                if (jobKey != null)
                {
                    var triggers = await scheduler.GetTriggersOfJob(jobKey);
                    var trigger = triggers.FirstOrDefault();
                    if (trigger != null)
                    {
                        var state = await scheduler.GetTriggerState(trigger.Key);
                        var next = trigger.GetNextFireTimeUtc()?.LocalDateTime;
                        var previous = trigger.GetPreviousFireTimeUtc()?.LocalDateTime;
                        job.PreviousFireTime = previous;
                        job.TriggerState = state.ToString();
                        job.NextFireTime = next;
                    }
                }
                jobs.Add(job);
            }
            return jobs;
        }
        public async Task<List<string>> GetJobTypeAsync()
        {
            var baseType = typeof(BaseJob);
            var jobTypes = new List<string>();
    
            // Lấy assembly chứa BaseJob
            var assembly = baseType.Assembly;
    
            // Lấy tất cả types trong assembly
            var types = assembly.GetTypes()
                .Where(t => t.IsClass 
                            && !t.IsAbstract 
                            && baseType.IsAssignableFrom(t) 
                            && t != baseType)
                .ToList();
    
            foreach (var type in types)
            {
                jobTypes.Add(type.FullName ?? type.Name);
            }
    
            return await Task.FromResult(jobTypes);
        }
        
        public async Task<bool> CreateJobAsync(DetailCJobConfigurationDto dto)
        {
            var existingJob = await GetSingleAsync<JobConfiguration>(j => j.JobName == dto.JobName);
            if (existingJob != null) throw new BusinessException(_sysMsg.Get(EMessage.CodeIsExist));
            var newJob = dto.Adapt<JobConfiguration>();
            var id = await CreateAsync(newJob);
            if (id > 0)
            {
                await RegisterJobAsync(newJob);
            }
            return id > 0;
        }
        
        
        public async Task<bool> UpdateJobAsync(UpdateJobScheduleDto dto)
        {
            var existingJob = await GetSingleAsync<JobConfiguration>(j => j.Id == dto.Id);
            if (existingJob is null) throw new NotFoundException(_sysMsg.Get(EMessage.Error404Msg));
            existingJob.CronExpression = dto.CronExpression;
            existingJob.Description = dto.Description;
            existingJob.JobDataJson = dto.JobDataJson;
            var success = await UpdateAsync(existingJob);
            if (success)
            {
                await UpdateScheduleAsync(existingJob.JobName, existingJob.CronExpression);
            }
            return success;
        }
        
        public async Task RegisterJobAsync(JobConfiguration dto)
        {
            try
            {
                var scheduler = await GetSchedulerAsync();
                var jobKey = new JobKey(dto.JobName, dto.JobGroup);

                if (await scheduler.CheckExists(jobKey))
                    throw new ConflictException(_sysMsg.Get(EMessage.CodeIsExist));

                // Dùng reflection để lấy kiểu job
                var jobType = Type.GetType(dto.JobType);
                if (jobType == null)
                    throw new NotFoundException(_sysMsg.Get(EMessage.Error404Msg) + $" {dto.JobType}");

                var job = JobBuilder.Create(jobType)
                    .WithIdentity(jobKey)
                    .WithDescription(dto.Description)
                    .Build();

                var trigger = TriggerBuilder.Create()
                    .WithIdentity($"{dto.JobName}_trigger", dto.JobGroup)
                    .WithCronSchedule(dto.CronExpression)
                    .StartNow()
                    .Build();
                await scheduler.ScheduleJob(job, trigger);
                await scheduler.TriggerJob(jobKey);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public async Task TriggerJobAsync(string jobName)
        {
            var scheduler = await GetSchedulerAsync();
            var jobKey = (await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()))
                .FirstOrDefault(x => x.Name == jobName);

            if (jobKey == null)
                throw new NotFoundException(_sysMsg.Get(EMessage.Error404Msg));

            await scheduler.TriggerJob(jobKey);
        }

        public async Task PauseJobAsync(string jobName)
        {
            var scheduler = await GetSchedulerAsync();
            var jobKey = (await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()))
                .FirstOrDefault(x => x.Name == jobName);

            if (jobKey != null)
                await scheduler.PauseJob(jobKey);
        }

        public async Task ResumeJobAsync(string jobName)
        {
            var scheduler = await GetSchedulerAsync();
            var jobKey = (await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()))
                .FirstOrDefault(x => x.Name == jobName);

            if (jobKey != null)
                await scheduler.ResumeJob(jobKey);
        }

        public async Task UpdateScheduleAsync(string jobName, string newCron)
        {
            var scheduler = await GetSchedulerAsync();
            var jobKey = (await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()))
                .FirstOrDefault(x => x.Name == jobName);

            if (jobKey == null)
                throw new NotFoundException(_sysMsg.Get(EMessage.Error404Msg));

            var triggers = await scheduler.GetTriggersOfJob(jobKey);
            var oldTrigger = triggers.FirstOrDefault();
            if (oldTrigger == null) return;
            string? oldCron = (oldTrigger as ICronTrigger)?.CronExpressionString;
            if (!string.IsNullOrEmpty(newCron) && newCron != oldCron)
            {
                var newTrigger = TriggerBuilder.Create()
                    .WithIdentity(oldTrigger.Key)
                    .ForJob(jobKey)
                    .WithCronSchedule(newCron)
                    .Build();
                await scheduler.RescheduleJob(oldTrigger.Key, newTrigger);
            }
        }
    }
}