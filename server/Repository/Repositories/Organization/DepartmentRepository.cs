using System.Text;
using Dapper;
using SqlKata;
using Model.DTOs.Organization;
using Model.Entities.Organization;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;
using Repository.Interfaces.Base;
using Model.Entities.System;
using Common.Extensions;

namespace Repository.Repositories.Organization;

public class DepartmentRepository : GenericRepository<Department, int>, IDepartmentRepository
{
    private readonly StringBuilder _sqlBuilder;     
    private readonly string _tableName;
    private readonly string _departmentTypeTableName;

    public DepartmentRepository(IDbConnectionFactory factory) : base(factory)   
    {
        _tableName = StringHelper.GetTableName<Department>();
        _departmentTypeTableName = StringHelper.GetTableName<DepartmentType>();
    }

    public async Task<List<DepartmentDto>> GetDepartmentTreeAsync()
    {
        var query = new Query(_tableName);
        query.Select(
                $"{_tableName}.{nameof(Department.Id)}",
                $"{_tableName}.{nameof(Department.Code)}",
                $"{_tableName}.{nameof(Department.Name)}",
                $"{_tableName}.{nameof(Department.ParentId)}",
                $"{_tableName}.{nameof(Department.Description)}",
                $"{_tableName}.{nameof(Department.DepartmentTypeCode)}",
                $"{_departmentTypeTableName}.{nameof(DepartmentType.Name)} as {nameof(DepartmentDto.DepartmentTypeName)}",
                $"{_tableName}.{nameof(Department.Address)}",
                $"{_tableName}.{nameof(Department.TreePath)}"
            )
            .LeftJoin(_departmentTypeTableName, $"{_departmentTypeTableName}.{nameof(DepartmentType.Code)}", nameof(Department.DepartmentTypeCode))
            .Where($"{_tableName}.{nameof(Department.IsDeleted)}", false)
            .OrderByDesc($"{_tableName}.{nameof(Department.CreatedBy)}");
        var compiledQuery = _compiler.Compile(query);

        var connection = _dbFactory.Connection;
        var allDepartments = await connection.QueryAsync<DepartmentDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return BuildDepartmentTree(allDepartments.ToList());
    }
    
   public async Task<List<DepartmentDto>> GetSingleDepartmentTreeAsync(int id)
   {
       var query = new Query(_tableName);
       query.Select(
               $"{_tableName}.{nameof(Department.Id)}",
               $"{_tableName}.{nameof(Department.Code)}",
               $"{_tableName}.{nameof(Department.Name)}",
               $"{_tableName}.{nameof(Department.ParentId)}",
               $"{_tableName}.{nameof(Department.Description)}",
               $"{_tableName}.{nameof(Department.DepartmentTypeCode)}",
               $"{_departmentTypeTableName}.{nameof(DepartmentType.Name)} as {nameof(DepartmentDto.DepartmentTypeName)}",
               $"{_tableName}.{nameof(Department.Address)}",
               $"{_tableName}.{nameof(Department.TreePath)}"
           )
           .LeftJoin(_departmentTypeTableName, $"{_departmentTypeTableName}.{nameof(DepartmentType.Code)}", nameof(Department.DepartmentTypeCode))
           .Where($"{_tableName}.{nameof(Department.IsDeleted)}", false)
           .WhereRaw($"CONCAT('.',{_tableName}.{nameof(Department.TreePath)},'.') LIKE CONCAT('%.',?,'.%')", id)
           .OrderByDesc($"{_tableName}.{nameof(Department.CreatedBy)}");
       
       var compiledQuery = _compiler.Compile(query);
   
       var connection = _dbFactory.Connection;
       var allDepartments = await connection.QueryAsync<DepartmentDto>(compiledQuery.Sql, compiledQuery.NamedBindings);
   
       return BuildDepartmentTree(allDepartments.ToList());
    }
    private List<DepartmentDto> BuildDepartmentTree(List<DepartmentDto> allDepartments)
    {
        // Build tree structure
        var rootDepartments = allDepartments.Where(m => m.ParentId == null || m.ParentId == 0).ToList();

        // Recursive function to build department tree
        void BuildDepartmentTreeRecursive(DepartmentDto parent)
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
            .OrderBy(nameof(Department.Name));

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<Department>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<Department>> GetByManagerAsync(long managerId)
    {
        var query = new Query($"{nameof(Department)}s")
            .Where(nameof(Department.IsDeleted), false)
            .OrderBy(nameof(Department.Name));

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<Department>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}