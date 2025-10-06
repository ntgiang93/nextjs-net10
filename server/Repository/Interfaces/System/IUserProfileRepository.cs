using System;
using System.Threading.Tasks;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile, long>
    {

    }
}