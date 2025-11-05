using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IFileRepository : IGenericRepository<FileStorage, int>
{
    /// <summary>
    ///     Gets files by reference ID and type
    ///     <param name="referenceId">The unique identifier used to reference the files.(entity id)</param>
    ///     <param name="referenceType">The type or category of the reference associated with the files.(name of entity)</param>
    /// </summary>
    Task<List<FileStorage>> GetByReferenceAsync(string referenceId, string referenceType);

    Task<bool> UpdateReferenceBatch(List<int> ids, string referenceId, string referenceType);
}