namespace Model.DTOs.System.Auth;

public class VerificationCacheData
{
    public VerificationCacheData()
    {
    }

    public VerificationCacheData(string code, string email, string phoneNumber, long userId)
    {
        UserId = userId;
        Code = code;
        Email = email;
        PhoneNumber = phoneNumber;
    }

    public long UserId { get; set; }
    public string Code { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
}