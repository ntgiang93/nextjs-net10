namespace Model.DTOs.System.Auth;

public class LoginDto
{
    public string UserName { get; set; }
    public string Password { get; set; }
    public string? Device { get; set; }
    public string DeviceId { get; set; }
    public string? DeviceToken { get; set; }
    public string? IpAddress { get; set; }
}

public class ForgotPasswordDto
{
    public required string Email { get; set; }
}

public class MedWorkingLoginDto
{
    public required string userName { get; set; }
    public required string password { get; set; }
}