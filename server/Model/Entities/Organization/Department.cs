using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

namespace Model.Entities.Organization;

[Table("Departments")]
public class Department : BaseEntity<int>
{
    [MaxLength(100)] public string TreePath { get; set; } = string.Empty;

    [Required] [MaxLength(255)] public string Name { get; set; } = string.Empty;

    [Required] [MaxLength(50)] public string Code { get; set; } = string.Empty;

    [MaxLength(1000)] public string? Description { get; set; }

    [Required] [MaxLength(50)] public string DepartmentTypeCode { get; set; }

    [ForeignKey("Parent")] public int ParentId { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(500)] public string? ContactInfo { get; set; }

    public long? ManagerId { get; set; }

    [MaxLength(500)] public string? Address { get; set; }

    [NotMapped] public List<Department>? Children { get; set; }
}