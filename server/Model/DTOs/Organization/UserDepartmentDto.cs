using System.ComponentModel.DataAnnotations;
using Model.Models;

namespace Model.DTOs.Organization;

public class DepartmentMemberDto
{
    public int Id { get; set; }
    public long UserId { get; set; }
    public string? FullName { get; set; }
    public required string UserName { get; set; }
    public string? Avatar { get; set; }
}

public class AddMemberDepartmentDto
{
    [Required] public required List<string> UserIds { get; set; }

    [Required] public int DepartmentId { get; set; }
}

public class RemoveDepartmentMemberDto
{
    [Required] public int DepartmentId { get; set; }
    [Required] public List<string> UserIds { get; set; }
}

public class UserDepartmentFilterDto: PaginationRequest
{
    public int DepartmentId { get; set; }
    public bool IsShowSubMembers { get; set; }
}

public class UserDeparmentCursorFilterDto
{
    public string SearchTerm { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int Limit { get; set; } = 50;
    /// <summary>
    /// cursor by created time
    /// </summary>
    public DateTime? Cursor { get; set; }
}