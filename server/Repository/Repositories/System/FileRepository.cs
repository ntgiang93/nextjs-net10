using Dapper;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories.System;

public class FileRepository : GenericRepository<FileStorage, int>, IFileRepository
{
    private readonly StringBuilder _sqlBuilder;

    public FileRepository(IDbConnectionFactory factory) : base(factory)
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
        
        using var connection = _connection;
        connection.Open();
        var result = await connection.QueryAsync<FileStorage>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
}