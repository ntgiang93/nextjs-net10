namespace Model.DTOs.System;

public class CategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
}

public class CategoryTreeDto: CategoryDto
{
    public List<CategoryTreeDto>? Children { get; set; }
}