using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

namespace Model.Entities.Organization;

[Table("Departments")]
public class Department : BaseEntity<int>
{
    [MaxLength(100)] public required string TreePath { get; set; } 

    [Required] [MaxLength(255)] public required string Name { get; set; }

    [Required] [MaxLength(50)] public required string Code { get; set; }

    [MaxLength(1000)] public string? Description { get; set; }

    [Required] [MaxLength(50)] public required string DepartmentTypeCode { get; set; }

    public int ParentId { get; set; }

    [MaxLength(500)] public string? Address { get; set; }
}