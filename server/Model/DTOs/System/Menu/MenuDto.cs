using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.Menu;

public class MenuDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string EngName { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public int? ParentId { get; set; }

    public string? Sysmodule { get; set; }

    public List<MenuDto>? Children { get; set; }
}

public class CreateMenuDto
{
    [Required] [StringLength(100)] public string Name { get; set; } = string.Empty;
    [Required] [StringLength(100)] public string EngName { get; set; } = string.Empty;
    [Required] [StringLength(200)] public string Url { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public int? ParentId { get; set; }

    public string? Sysmodule { get; set; }
}

public class UpdateMenuDto : CreateMenuDto
{
    [Required] public int Id { get; set; }
}

public class MenuOrderItem
{
    [Required] public Guid Id { get; set; }

    [Required] public int DisplayOrder { get; set; }

    public Guid? ParentId { get; set; }
}