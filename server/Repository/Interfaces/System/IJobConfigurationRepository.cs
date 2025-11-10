using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IJobConfigurationRepository : IGenericRepository<JobConfiguration, int>
{
    Task<List<JobConfiguration>> GetActiveJobsAsync();
    Task<JobConfiguration?> GetByJobNameAndGroupAsync(string jobName, string jobGroup);
    Task<bool> ExistsAsync(string jobName, string jobGroup);
}

