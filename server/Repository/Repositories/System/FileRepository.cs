using System.Text;
using Dapper;
using SqlKata;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;

namespace Repository.Repositories.System;

public class FileRepository : GenericRepository<FileStorage, int>, IFileRepository
{
    private readonly StringBuilder _sqlBuilder;

    public FileRepository(AppSettings appSettings) : base(appSettings)
    {
        _sqlBuilder = new StringBuilder();
    }

    public async Task<List<FileStorage>> GetByReferenceAsync(string referenceId, string referenceType)
    {
        var query = new Query("FileStorage")
            .Where("IsDeleted", false)
            .Where("ReferenceId", referenceId)
            .Where("ReferenceType", referenceType)
            .OrderByDesc("CreatedAt");

        var compiledQuery = _compiler.Compile(query);
        
        using var connection = Connection;
        var result = await connection.QueryAsync<FileStorage>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}