using Dapper;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;
using System.Text;

namespace Repository.Repositories.System
{
    public class UserProfileRepository : GenericRepository<UserProfile, int>, IUserProfileRepository
    {
        private readonly StringBuilder _sqlBuilder;

        public UserProfileRepository(AppSettings appSettings) : base(appSettings)
        {
            _sqlBuilder = new StringBuilder();
        }

        // GET methods can be implemented as needed
        public async Task<UserProfile?> GetByUserIdAsync(long userId)
        {
            var query = new Query("UserProfile")
                .Where("UserId", userId)
                .Where("IsDeleted", false);

            var compiledQuery = _compiler.Compile(query);
            
            using var connection = Connection;
            var result = await connection.QueryFirstOrDefaultAsync<UserProfile>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }

        // UPDATE methods can be implemented as needed
    }
}