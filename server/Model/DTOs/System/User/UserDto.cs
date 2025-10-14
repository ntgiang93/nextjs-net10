namespace Model.DTOs.System.User;

public class UserDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string FullName { get; set; }
    public bool IsActive { get; set; }
    public bool TwoFa { get; set; }
    public bool isLocked { get; set; }
    public DateTime? LockExprires { get; set; }
    public List<int> Roles { get; set; }
    public List<string> RolesName { get; set; }

}