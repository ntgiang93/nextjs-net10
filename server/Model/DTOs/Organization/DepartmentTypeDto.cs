using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.Organization;

public class DepartmentTypeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Level { get; set; }

    public bool IsActive { get; set; }

    public string Code { get; set; } = string.Empty;
}

public class CreateDepartmentTypeDto
{
    [Required] [StringLength(20)] public string Code { get; set; } = string.Empty;

    [Required] [StringLength(100)] public string Name { get; set; } = string.Empty;

    [StringLength(500)] public string? Description { get; set; }

    [Required] public int Level { get; set; }

    public int DisplayOrder { get; set; }
}

public class UpdateDepartmentTypeDto : CreateDepartmentTypeDto
{
    [Required] public int Id { get; set; }

    public bool IsActive { get; set; }
}