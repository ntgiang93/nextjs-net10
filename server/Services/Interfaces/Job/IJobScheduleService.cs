using Model.DTOs.System;
using Model.Entities.System;
using Quartz;
using Service.Interfaces.Base;

namespace Services.Interfaces.System;

public interface IJobScheduleService: IGenericService<JobConfiguration, int>
{
    Task<List<string>> GetJobTypeAsync();
    Task<bool> CreateJobAsync(DetailCJobConfigurationDto dto);
    Task<bool> UpdateJobAsync(UpdateJobScheduleDto dto);
    Task<IEnumerable<JobScheduleDto>> GetAllJobsAsync();

    Task TriggerJobAsync(string jobName);

    Task PauseJobAsync(string jobName);

    Task ResumeJobAsync(string jobName);

    Task UpdateScheduleAsync(string jobName, string newCron);
}

