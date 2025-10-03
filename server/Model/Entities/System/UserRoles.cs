using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("UserRoles")]
public class UserRoles
{
    [Required] public long UserId { get; set; }

    [Required] public long RoleId { get; set; }

    // Note: Configure composite keys using Fluent API.
}