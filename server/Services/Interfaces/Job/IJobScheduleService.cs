using Model.DTOs.System;
using Quartz;

namespace Services.Interfaces.System;

public interface IJobScheduleService
{
    Task<IEnumerable<object>> GetAllJobsAsync();

    Task TriggerJobAsync(string jobName);

    Task PauseJobAsync(string jobName);

    Task ResumeJobAsync(string jobName);

    Task UpdateScheduleAsync(string jobName, string newCron);
}

