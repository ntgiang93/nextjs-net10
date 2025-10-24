namespace Model.DTOs.System.Role;

public class RoleDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
}

public class RoleViewDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsProtected { get; set; } = false;
}

public class RoleClaimDto
{
    public int Id { get; set; }
    public required string Code { get; set; }
}