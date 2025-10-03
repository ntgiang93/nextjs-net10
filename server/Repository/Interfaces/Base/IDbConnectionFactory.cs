using System.Data;

namespace Repository.Interfaces.Base;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}