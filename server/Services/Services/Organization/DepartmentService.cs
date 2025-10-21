using Common.Exceptions;
using Mapster;
using Model.Constants;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Service.Interfaces.Organization;
using Service.Services.Base;

namespace Services.Services.Organization;

public class DepartmentService : GenericService<Department, int>, IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        IServiceProvider serviceProvider) : base(departmentRepository, serviceProvider)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<List<DepartmentDto>> GetDepartmentTreeAsync()
    {
        var departments = await _departmentRepository.GetDepartmentTreeAsync();
        return departments;
    }
    
    public async Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id)
    {
        var departments = await _departmentRepository.GetSingleDepartmentTreeAsync(id);
        return departments;
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(DetailDepartmentDto dto)
    {
        // Check if code exists
        var existingDepartment = await GetSingleAsync<Department>(x => x.Code == dto.Code && x.IsDeleted == false);
        if (existingDepartment != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_CODE_EXISTS");
        // Check if parent department exists
        var department = dto.Adapt<Department>();
        if (dto.ParentId > 0)
        {
            var parentDepartment = await GetSingleAsync<Department>(x => x.Id == dto.ParentId);
            department.TreePath = $"{parentDepartment?.TreePath}.{parentDepartment?.Id}";
        }
        else department.TreePath = "0";
        var newDepartment = await CreateAsync(department);
        return newDepartment.Adapt<DepartmentDto>();
    }

    public async Task<bool> UpdateDepartmentAsync(DetailDepartmentDto dto)
    {
        // Check if code exists
        var existingCode = await GetSingleAsync<Department>(x => x.Code == dto.Code && x.Id != dto.Id && x.IsDeleted == false);
        if (existingCode != null)
            throw new BusinessException(SysMsg.Get(EMessage.CodeIsExist), "DEPARTMENT_CODE_EXISTS");
        else
        {
            var existingDepartment = await GetSingleAsync<Department>(x => x.Id == dto.Id && x.IsDeleted == false);
            if (existingDepartment == null)
                throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg), "DEPARTMENT_NOT_FOUND");
        }
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