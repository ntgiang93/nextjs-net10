using System.ComponentModel.DataAnnotations;

namespace Model.Entities.System;

public class SysCategory : BaseEntity<int>
{
    [Required] [StringLength(100)] public string Name { get; set; }

    [StringLength(500)] public string? Description { get; set; }
}