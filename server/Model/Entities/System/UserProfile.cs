using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("UserProfiles")]
public class UserProfile : BaseEntity<int>
{
    [Required] public long UserId { get; set; }

    [StringLength(500)] public string? Address { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [StringLength(50)] public string? Gender { get; set; }
}