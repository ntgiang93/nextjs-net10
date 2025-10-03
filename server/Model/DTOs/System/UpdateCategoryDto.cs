using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System;

public class UpdateCategoryDto
{
    [Required] public int Id { get; set; }

    [Required] [StringLength(100)] public string Name { get; set; }

    [StringLength(500)] public string? Description { get; set; }
}