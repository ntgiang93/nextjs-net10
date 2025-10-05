using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("SysCategories")]
public class SysCategory : BaseEntity<int>
{
    [Required] [StringLength(100)] public string Name { get; set; }

    [StringLength(500)] public string? Description { get; set; }
}