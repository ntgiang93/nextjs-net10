using System.ComponentModel.DataAnnotations;
using Model.DTOs.Base;
using Model.Models;

namespace Model.DTOs.System.Role;

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

public class AddMemberRoleDto
{
    [Required(ErrorMessage = "UserIds is required")]
    [MinLength(1, ErrorMessage = "At least one user must be specified")]
    public required List<string> UserIds { get; set; }

    [Required(ErrorMessage = "RoleId is required")]
    [Range(1, int.MaxValue, ErrorMessage = "RoleId must be greater than 0")]
    public int RoleId { get; set; }
}

public class UserRoleCursorFilterDto
{
    public string SearchTerm { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public int Limit { get; set; } = 50;
    /// <summary>
    /// cursor by created time
    /// </summary>
    public DateTime? Cursor { get; set; }
}

public class GetRoleMembersDto: PaginationRequest
{
    public int RoleId { get; set; }
}

