using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.UserProfile;

public class UserProfileDto
{
    public int Id { get; set; }

    public long UserId { get; set; }

    public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Gender { get; set; }
}

public class SaveUserProfileDto
{
    public int Id { get; set; }
    [Required] public long UserId { get; set; }

    public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Gender { get; set; }
}