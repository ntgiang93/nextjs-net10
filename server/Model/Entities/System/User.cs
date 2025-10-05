using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("Users")]
public class User : BaseEntity<string>
{
    [Required] [StringLength(100)] public string Username { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; }

    [Required] [StringLength(256)] public string PasswordHash { get; set; }

    [StringLength(256)] public string? Avatar { get; set; }

    [StringLength(15)] public string? Phone { get; set; }

    [StringLength(100)] public string FullName { get; set; }

    public bool EmailVerified { get; set; } = false;
    public bool PhoneVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public bool TwoFa { get; set; }
    public bool IsLocked { get; set; } = false;
    public DateTime LockExprires { get; set; } = default;
    [StringLength(50)] public string? Language { get; set; }
}