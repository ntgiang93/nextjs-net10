using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// ...existing using statements...

namespace Model.Entities.System;

[Table("Files")]
public class FileStorage : BaseEntity<int>
{
    [Required] [StringLength(255)] public string FileName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    [Required] [StringLength(100)] public string MimeType { get; set; } = string.Empty;

    [Required] [StringLength(500)] public string FilePath { get; set; } = string.Empty;

    [StringLength(30)] public string? ReferenceId { get; set; }

    [StringLength(100)] public string? ReferenceType { get; set; }

    [StringLength(100)] public string? Container { get; set; }

    public bool IsPublic { get; set; }
}