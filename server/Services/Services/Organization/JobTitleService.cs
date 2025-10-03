using System;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Service.Services.Organization;

public class JobTitleService : GenericService<JobTitle, int>, IJobTitleService
{
    private readonly IJobTitleRepository _jobTitleRepository;

    public JobTitleService(
        IJobTitleRepository jobTitleRepository,
        IServiceProvider serviceProvider) : base(jobTitleRepository, serviceProvider)
    {
    }

    // Add specific implementations if needed
}