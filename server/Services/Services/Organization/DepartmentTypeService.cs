using System;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Service.Services.Organization;

public class DepartmentTypeService : GenericService<DepartmentType, int>, IDepartmentTypeService
{
    public DepartmentTypeService(
        IDepartmentTypeRepository departmentTypeRepository,
        IServiceProvider serviceProvider) : base(departmentTypeRepository, serviceProvider)
    {
    }
}