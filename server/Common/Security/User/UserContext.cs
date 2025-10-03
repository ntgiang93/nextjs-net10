using System.Threading;

namespace Common.Security
{
    public class UserContext
    {
        private static readonly AsyncLocal<CurrentUser> _currentUser = new AsyncLocal<CurrentUser>();

        public static CurrentUser Current
        {
            get => _currentUser.Value;
            set => _currentUser.Value = value;
        }

        public static void Clear()
        {
            _currentUser.Value = null;
        }
    }
}