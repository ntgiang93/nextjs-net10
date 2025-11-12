using Dapper;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;
using Common.Extensions;

namespace Repository.Repositories.System;

public class FileRepository : GenericRepository<FileStorage, int>, IFileRepository
{
    private readonly string _table = StringHelper.GetTableName<FileStorage>();

    public FileRepository(IDbConnectionFactory factory) : base(factory)
    {
    }

    public async Task<List<FileStorage>> GetByReferenceAsync(string referenceId, string referenceType, string domain)
    {
        var query = new Query(_table)
            .Select(
                nameof(FileStorage.Id),
                nameof(FileStorage.FileName),
                nameof(FileStorage.FileSize),
                nameof(FileStorage.MimeType)
            )
            .SelectRaw("CONCAT(?, " + nameof(FileStorage.FilePath) + ") as " + nameof(FileStorage.FilePath), domain)
            .Select(
                nameof(FileStorage.ReferenceId),
                nameof(FileStorage.ReferenceType),
                nameof(FileStorage.Container),
                nameof(FileStorage.IsPublic),
                nameof(FileStorage.CreatedAt),
                nameof(FileStorage.UpdatedAt)
            )   
            .Where(nameof(FileStorage.IsDeleted), false)
            .Where(nameof(FileStorage.ReferenceId), referenceId)
            .Where(nameof(FileStorage.ReferenceType), referenceType)
            .OrderByDesc(nameof(FileStorage.CreatedAt));

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.QueryAsync<FileStorage>(compiledQuery.Sql, compiledQuery.NamedBindings);
        
        return result.ToList();
    }
    
    public async Task<bool> UpdateReferenceBatch(List<int> ids, string referenceId, string referenceType)
    {
        var query = new Query(_table)
            .WhereIn(nameof(FileStorage.Id), ids)
            .Where(nameof(FileStorage.IsDeleted), false);
        query.AsUpdate(new
        {
            ReferenceId = referenceId,
            ReferenceType = referenceType,
        });

        var compiledQuery = _compiler.Compile(query);
        
        var connection = _dbFactory.Connection;
        var result = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);

        return result > 0;
    }
}