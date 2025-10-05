using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mapster;
using Common.Exceptions;
using Model.Constants;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Service.Services.Organization;

public class DepartmentService : GenericService<Department, int>, IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IDepartmentTypeRepository _departmentTypeRepository;
    private readonly IUserDepartmentRepository _userDepartmentRepository;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        IDepartmentTypeRepository departmentTypeRepository,
        IUserDepartmentRepository userDepartmentRepository,
        IServiceProvider serviceProvider) : base(departmentRepository, serviceProvider)
    {
        _departmentRepository = departmentRepository;
        _departmentTypeRepository = departmentTypeRepository;
        _userDepartmentRepository = userDepartmentRepository;
    }

    public async Task<List<TableDepartmentDto>> GetDepartmentTreeAsync()
    {
        var departments = await _departmentRepository.GetDepartmentTreeAsync();
        return departments;
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        // Check if code exists
        var existingDepartment = await GetSingleAsync<Department>(x => x.Code == dto.Code);
        if (existingDepartment != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_CODE_EXISTS");
        // Check if parent department exists
        var department = dto.Adapt<Department>();
        if (dto.ParentId > 0)
        {
            var parentDepartment = await GetSingleAsync<Department>(x => x.Id == dto.ParentId);
            department.TreePath = $"{parentDepartment?.TreePath}.{parentDepartment?.Id}";
        }

        var newDepartment = await CreateAsync(department);
        return newDepartment.Adapt<DepartmentDto>();
    }

    public async Task<bool> UpdateDepartmentAsync(UpdateDepartmentDto dto)
    {
        // Check if code exists
        var existingDepartment = await GetSingleAsync<Department>(x => x.Code == dto.Code && x.Id != dto.Id);
        if (existingDepartment != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_CODE_EXISTS");
        var result = await UpdateAsync(dto.Adapt<Department>());
        return result;
    }


    public async Task<bool> DeleteDepartmentAsync(int id)
    {
        var success = await SoftDeleteAsync(id);
        //if (success) await BatchUpdateAsync(d => d.ParentId == id, d => d.SetProperty(x => x.IsDeleted, true));
        return success;
    }
}