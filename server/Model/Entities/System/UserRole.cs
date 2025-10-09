using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("UserRoles")]
public class UserRole
{
    [Key]
    public int Id { get; set; }
    [Required] public string UserId { get; set; }

    [Required] public int RoleId { get; set; }
}