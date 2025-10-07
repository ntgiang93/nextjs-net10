using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Model.Models;
using Repository.Interfaces.Base;
using System.Data;

namespace Repository.Repositories.Base;

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _mainConnectionString;
    private IDbConnection _connection;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _mainConnectionString = configuration.GetConnectionString("MainDb")
            ?? configuration["ConnectionStrings:MainDb"]
            ?? throw new InvalidOperationException("Connection string 'MainDb' is not configured.");
    }

    public IDbConnection Connection
    {
        get
        {
            if (_connection == null || _connection.State == ConnectionState.Closed)
            {
                _connection = new SqlConnection(_mainConnectionString);
                _connection.Open();
            }
            return _connection;
        }
    }
    public void Dispose()
    {
        _connection?.Dispose();
    }
}