namespace Common.Security.User;

public class CurrentUser
{
    public required string UserId { get; set; }
    public required string UserName { get; set; }
    public required List<int> Roles { get; set; }
    public required string RoleCodes { get; set; }
    public string? Language { get; set; } = "vi";
}