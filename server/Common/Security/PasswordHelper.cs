using System.Security.Cryptography;

namespace Common.Security
{
    public static class PasswordHelper
    {
        // Số byte cho salt và kích thước của key
        private const int SaltSize = 32;
        private const int KeySize = 32;  // 256 bit
                                         // Số vòng lặp, bạn có thể tăng giá trị này để tăng độ bảo mật (tuy nhiên cũng làm chậm quá trình)
        private const int Iterations = 310000;

        public static string HashPassword(string password)
        {
            // Tạo một salt ngẫu nhiên
            byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

            // Tạo key hash dựa trên password, salt và số vòng lặp
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA512))
            {
                byte[] key = pbkdf2.GetBytes(KeySize);
                // Kết hợp salt và key, cách nhau bởi dấu ":"
                return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(key)}";
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            // Tách salt và key từ chuỗi đã hash
            var parts = hashedPassword.Split(':');
            if (parts.Length != 2)
                return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] key = Convert.FromBase64String(parts[1]);

            // Tạo key hash từ password cần xác thực
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA512))
            {
                byte[] keyToCheck = pbkdf2.GetBytes(KeySize);
                // So sánh key đã tạo với key được lưu trữ
                return CryptographicOperations.FixedTimeEquals(keyToCheck, key);
            }
        }
    }
}
