using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("Roles")]

public class Role : BaseEntity<int>
{
    [Required] [StringLength(30)] public string Code { get; set; }
    [Required] [StringLength(100)] public string Name { get; set; }
    [StringLength(500)] public string? Description { get; set; }
    public bool IsProtected { get; set; } = false;
}