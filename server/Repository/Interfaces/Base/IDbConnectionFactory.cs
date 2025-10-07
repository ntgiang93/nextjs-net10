using System.Data;

namespace Repository.Interfaces.Base;

public interface IDbConnectionFactory: IDisposable
{
    IDbConnection Connection { get; }
}