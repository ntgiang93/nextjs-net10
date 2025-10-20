using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

// ...existing using statements...

namespace Model.Entities.Organization;

[Table("DepartmentTypes")]
public class DepartmentType : BaseEntity<int>
{
    [Required] [StringLength(50)] public string Code { get; set; } = string.Empty;

    [Required] [StringLength(100)] public string Name { get; set; } = string.Empty;

    [StringLength(1000)] public string? Description { get; set; }

    public int Level { get; set; }

}