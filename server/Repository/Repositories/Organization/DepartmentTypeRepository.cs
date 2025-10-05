using System.Text;
using Dapper;
using SqlKata;
using Model.Entities.Organization;
using Model.Models;
using Repository.Interfaces.Organization;
using Repository.Repositories.Base;
using Repository.Interfaces.Base;

namespace Repository.Repositories.Organization
{
    public class DepartmentTypeRepository : GenericRepository<DepartmentType, int>, IDepartmentTypeRepository
    {
        private readonly StringBuilder _sqlBuilder;

        public DepartmentTypeRepository(IDbConnectionFactory factory) : base(factory)
        {
            _sqlBuilder = new StringBuilder();
        }

        public async Task<List<DepartmentType>> GetActiveTypesAsync()
        {
            var query = new Query("DepartmentType")
                .Where("IsDeleted", false)
                .Where("IsActive", true)
                .OrderBy("Name");

            var compiledQuery = _compiler.Compile(query);
            
            using var connection = _connection;
            connection.Open();
            var result = await connection.QueryAsync<DepartmentType>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result.ToList();
        }

        public async Task<DepartmentType?> GetByCodeAsync(string code)
        {
            var query = new Query("DepartmentType")
                .Where("Code", code)
                .Where("IsDeleted", false);

            var compiledQuery = _compiler.Compile(query);
            
            using var connection = _connection;
            connection.Open();
            var result = await connection.QueryFirstOrDefaultAsync<DepartmentType>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }
    }
}
