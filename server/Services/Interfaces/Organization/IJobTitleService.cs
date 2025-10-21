using Model.DTOs.Organization;
using Model.Entities.Organization;
using Service.Interfaces.Base;

namespace Service.Interfaces.Organization;

public interface IJobTitleService : IGenericService<JobTitle, int>
{
    Task<JobTitleDto> CreateJobTitleAsync(JobTitleDto dto);
    Task<bool> UpdateJobTitleAsync(JobTitleDto dto);
}