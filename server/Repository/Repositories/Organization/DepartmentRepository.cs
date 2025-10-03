using System.Text;
using Dapper;
using SqlKata;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Model.Models;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;

namespace Repository.Repositories.Organization;

public class DepartmentRepository : GenericRepository<Department, int>, IDepartmentRepository
{
    private readonly StringBuilder _sqlBuilder;

    public DepartmentRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<TableDepartmentDto>> GetDepartmentTreeAsync()
    {
        _sqlBuilder.Clear();
        _sqlBuilder.Append($@"
            SELECT 
                d.{nameof(Department.Id)},
                d.{nameof(Department.Code)},
                d.{nameof(Department.Name)},
                d.{nameof(Department.ParentId)},
                d.{nameof(Department.DepartmentTypeCode)},
                dt.{nameof(DepartmentType.Name)} as DepartmentTypeName,
                u.{nameof(User.FullName)} as ManagerName,
                d.{nameof(Department.ContactInfo)},
                d.{nameof(Department.Address)}
            FROM {nameof(Department)}s d
            INNER JOIN {nameof(DepartmentType)}s dt ON d.{nameof(Department.DepartmentTypeCode)} = dt.{nameof(DepartmentType.Code)}
            LEFT JOIN {nameof(User)}s u ON d.{nameof(Department.ManagerId)} = u.{nameof(User.Id)}
            WHERE d.{nameof(Department.IsActive)} = 1 AND d.{nameof(Department.IsDeleted)} = 0
            ORDER BY d.{nameof(Department.Id)} DESC");

        using var connection = Connection;
        var allDepartments = await connection.QueryAsync<TableDepartmentDto>(_sqlBuilder.ToString());
        
        return BuildDepartmentTree(allDepartments.ToList());
    }

    private List<TableDepartmentDto> BuildDepartmentTree(List<TableDepartmentDto> allDepartments)
    {
        // Build tree structure
        var rootDepartments = allDepartments.Where(m => m.ParentId == null || m.ParentId == 0).ToList();

        // Recursive function to build department tree
        void BuildDepartmentTreeRecursive(TableDepartmentDto parent)
        {
            parent.Children = allDepartments
                .Where(d => d.ParentId == parent.Id)
                .OrderBy(d => d.Name)
                .ToList();

            foreach (var child in parent.Children) 
                BuildDepartmentTreeRecursive(child);
        }

        // Build tree for each root department
        foreach (var rootDepartment in rootDepartments) 
            BuildDepartmentTreeRecursive(rootDepartment);
            
        return rootDepartments;
    }

    public async Task<List<Department>> GetByTypeAsync(string departmentTypeCode)
    {
        var query = new Query($"{nameof(Department)}s")
            .Where(nameof(Department.DepartmentTypeCode), departmentTypeCode)
            .Where(nameof(Department.IsDeleted), false)
            .Where(nameof(Department.IsActive), true)
            .OrderBy(nameof(Department.Name));

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<Department>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<Department>> GetByManagerAsync(long managerId)
    {
        var query = new Query($"{nameof(Department)}s")
            .Where(nameof(Department.ManagerId), managerId)
            .Where(nameof(Department.IsDeleted), false)
            .Where(nameof(Department.IsActive), true)
            .OrderBy(nameof(Department.Name));

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<Department>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}