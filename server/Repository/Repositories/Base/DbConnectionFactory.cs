using Microsoft.Data.SqlClient;
using Model.Models;
using Repository.Interfaces.Base;
using System.Data;

namespace Repository.Repositories.Base;

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _mainConnectionString;

    public DbConnectionFactory(AppSettings appSettings)
    {
        _mainConnectionString = appSettings.ConnectionStrings.MainDb;
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_mainConnectionString);
    }
}