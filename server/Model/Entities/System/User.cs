using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("Users")]
public class User : BaseEntity<string>
{
    [Dapper.Contrib.Extensions.ExplicitKey]
    public override string Id { get; set; } = string.Empty;
    [Required] [StringLength(100)] public string UserName { get; set; } = string.Empty;
    public int EmployeeCode { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required] [StringLength(256)] public string PasswordHash { get; set; } = string.Empty;

    [StringLength(256)] public string? Avatar { get; set; }

    [StringLength(15)] public string? Phone { get; set; }

    [StringLength(100)] public string FullName { get; set; } = string.Empty;

    public bool EmailVerified { get; set; }
    public bool PhoneVerified { get; set; }
    public bool IsActive { get; set; } = true;
    public bool TwoFa { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockExprires { get; set; }
    [StringLength(50)] public string? Language { get; set; }
}