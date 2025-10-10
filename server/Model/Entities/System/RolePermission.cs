using Model.Constants;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("RolePermissions")]
public class RolePermission
{
    [Required] public int RoleId { get; set; }

    [Required] public required string SysModule { get; set; }

    [Required] public EPermission Permission { get; set; }
}