using Microsoft.Data.SqlClient;
using Model.Models;
using Repository.Interfaces.Base;
using System.Data;

namespace Repository.Implementations;

public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(AppSettings appSettings)
    {
        _connectionString = appSettings.ConnectionStrings.MainDb;
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}