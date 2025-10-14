using System.ComponentModel.DataAnnotations;

public class CreateUserDto
{
    public string FullName { get; set; }
    public string UserName { get; set; }
    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }
    public List<int> Roles { get; set; }
}