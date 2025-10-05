using Dapper;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;

namespace Repository.Repositories.System
{
    public class UserProfileRepository : GenericRepository<UserProfile, int>, IUserProfileRepository
    {
        public UserProfileRepository(IDbConnectionFactory factory) : base(factory)
        {
        }

        // GET methods can be implemented as needed
        public async Task<UserProfile?> GetByUserIdAsync(long userId)
        {
            var query = new Query("UserProfile")
                .Where("UserId", userId)
                .Where("IsDeleted", false);

            var compiledQuery = _compiler.Compile(query);
            
            using var connection = _connection;
            connection.Open();
            var result = await connection.QueryFirstOrDefaultAsync<UserProfile>(compiledQuery.Sql, compiledQuery.NamedBindings);
            
            return result;
        }
    }
}