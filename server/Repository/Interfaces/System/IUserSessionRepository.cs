using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface IUserSessionRepository : IGenericRepository<UserTokens, long>
{
}