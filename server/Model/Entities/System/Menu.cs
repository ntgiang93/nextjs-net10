using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("Menus")]
public class Menu : BaseEntity<int>
{
    [Required] [StringLength(100)] public string Name { get; set; } = string.Empty;
    [Required] [StringLength(100)] public string EngName { get; set; } = string.Empty;
    [Required] [StringLength(200)] public string Url { get; set; } = string.Empty;

    [Required] [StringLength(100)] public string? Icon { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public int? ParentId { get; set; }

    [StringLength(100)] public string? Sysmodule { get; set; }
}