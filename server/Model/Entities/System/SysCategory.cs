using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("SysCategories")]
public class SysCategory : BaseEntity<int>
{
    [Required] public required string Name { get; set; }
    public required string Code { get; set; }
    /// <summary>
    /// Mã loại của danh mục. Giá trị là mã của danh mục cha (hoặc mã nhóm) dùng để phân nhóm/nhận diện loại danh mục.
    /// Danh mục cha/ nhóm thì không có type.
    /// </summary>
    public required string Type { get; set; }
    [StringLength(500)] public string? Description { get; set; }
}