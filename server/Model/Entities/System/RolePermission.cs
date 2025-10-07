using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("RolePermissions")]
public class RolePermission
{
    [Required] public string Role { get; set; }

    [Required] public string SysModule { get; set; }

    [Required] public string Permission { get; set; }

    // Note: For composite key configuration, use Fluent API.
}