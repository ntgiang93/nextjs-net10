using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Repository.Interfaces.Base;
using System.Data;

namespace Repository.Repositories.Base;

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _mainConnectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _mainConnectionString = configuration.GetConnectionString("MainDb")
            ?? configuration["ConnectionStrings:MainDb"]
            ?? throw new InvalidOperationException("Connection string 'MainDb' is not configured.");
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_mainConnectionString);
    }
}