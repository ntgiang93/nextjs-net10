using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.UserProfile;

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Gender { get; set; }
    public int JobTitleId { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
}

public class SaveUserProfileDto
{
    public string Id { get; set; }
    public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Gender { get; set; }
    public int JobTitleId { get; set; }
}