using Dapper;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories.System;

public class SysCategoryRepository : GenericRepository<SysCategory, int>, ISysCategoryRepository
{
    private readonly StringBuilder _sqlBuilder;

    public SysCategoryRepository(IDbConnectionFactory factory) : base(factory)
    {
        _sqlBuilder = new StringBuilder();
    }

    // Example method - get categories by type
    public async Task<List<SysCategory>> GetByTypeAsync(string categoryType)
    {
        var query = new Query("SysCategory")
            .Where("CategoryType", categoryType)
            .Where("IsDeleted", false)
            .OrderBy("DisplayOrder");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryAsync<SysCategory>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    // Example method - get active categories
    public async Task<List<SysCategory>> GetActiveAsync()
    {
        var query = new Query("SysCategory")
            .Where("IsDeleted", false)
            .Where("IsActive", true)
            .OrderBy("DisplayOrder", "Name");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryAsync<SysCategory>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}