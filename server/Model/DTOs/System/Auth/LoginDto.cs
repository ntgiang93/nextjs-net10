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