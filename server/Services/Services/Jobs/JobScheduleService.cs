using Quartz;
using Quartz.Impl.Matchers;
using Services.Interfaces.System;

namespace Services.Services.System
{
    public class JobScheduleService: IJobScheduleService
    {
        private readonly ISchedulerFactory _schedulerFactory;

        public JobScheduleService(ISchedulerFactory schedulerFactory)
        {
            _schedulerFactory = schedulerFactory;
        }

        private async Task<IScheduler> GetSchedulerAsync() => await _schedulerFactory.GetScheduler();

        public async Task<IEnumerable<object>> GetAllJobsAsync()
        {
            var scheduler = await GetSchedulerAsync();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());

            var jobs = new List<object>();

            foreach (var jobKey in jobKeys)
            {
                var triggers = await scheduler.GetTriggersOfJob(jobKey);
                foreach (var trigger in triggers)
                {
                    var cron = trigger is ICronTrigger cronTrigger ? cronTrigger.CronExpressionString : "N/A";
                    var next = trigger.GetNextFireTimeUtc()?.ToLocalTime();
                    var prev = trigger.GetPreviousFireTimeUtc()?.ToLocalTime();

                    jobs.Add(new
                    {
                        JobName = jobKey.Name,
                        Group = jobKey.Group,
                        TriggerName = trigger.Key.Name,
                        State = await scheduler.GetTriggerState(trigger.Key),
                        Cron = cron,
                        NextFireTime = next,
                        PreviousFireTime = prev
                    });
                }
            }

            return jobs;
        }

        public async Task TriggerJobAsync(string jobName)
        {
            var scheduler = await GetSchedulerAsync();
            var jobKey = (await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()))
                .FirstOrDefault(x => x.Name == jobName);

            if (jobKey == null)
                throw new Exception($"Job '{jobName}' không tồn tại");

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
                throw new Exception($"Không tìm thấy job {jobName}");

            var triggers = await scheduler.GetTriggersOfJob(jobKey);
            var oldTrigger = triggers.FirstOrDefault();
            if (oldTrigger == null)
                throw new Exception($"Job {jobName} không có trigger");

            var newTrigger = TriggerBuilder.Create()
                .WithIdentity(oldTrigger.Key)
                .ForJob(jobKey)
                .WithCronSchedule(newCron)
                .Build();

            await scheduler.RescheduleJob(oldTrigger.Key, newTrigger);
        }
    }
}
