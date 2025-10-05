using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("UserRole")]
public class UserRole
{
    [Required] public string UserId { get; set; }

    [Required] public int RoleId { get; set; }
}