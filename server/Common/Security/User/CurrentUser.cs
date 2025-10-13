namespace Common.Security;

public class CurrentUser
{
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<int> Roles { get; set; }
    public string RoleCodes { get; set; }
    public string? Language { get; set; } = "vi-VN";
}