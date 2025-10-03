using System.Text;
using Dapper;
using SqlKata;
using Model.Entities.Organization;
using Model.Models;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;

namespace Repository.Repositories.Organization;

public class JobTitleRepository : GenericRepository<JobTitle, int>, IJobTitleRepository
{
    private readonly StringBuilder _sqlBuilder;

    public JobTitleRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<JobTitle>> GetActiveJobTitlesAsync()
    {
        var query = new Query("JobTitle")
            .Where("IsDeleted", false)
            .Where("IsActive", true)
            .OrderBy("Name");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<JobTitle>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }

    public async Task<List<JobTitle>> GetByLevelAsync(int level)
    {
        var query = new Query("JobTitle")
            .Where("Level", level)
            .Where("IsDeleted", false)
            .Where("IsActive", true)
            .OrderBy("Name");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<JobTitle>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}