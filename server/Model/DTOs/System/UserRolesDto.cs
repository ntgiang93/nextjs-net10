namespace Model.DTOs.System.UserRole;

public class UserRoleDto
{
    public string RolesId { get; set; }
    public string RoleCode { get; set; } = string.Empty;
}

public class RoleMembersDto
{
    public string Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Avartar { get; set; } = string.Empty;
}