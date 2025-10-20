using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.Organization;

public class DepartmentTypeDto
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public int Level { get; set; }

    public required string Code { get; set; }
}

public class CreateDepartmentTypeDto
{
    [Required] [StringLength(20)] required public string Code { get; set; } 

    [Required] [StringLength(100)] required public string Name { get; set; }

    [StringLength(500)] public string? Description { get; set; }

    [Required] public int Level { get; set; }
}

public class UpdateDepartmentTypeDto : CreateDepartmentTypeDto
{
    [Required] public int Id { get; set; }

}