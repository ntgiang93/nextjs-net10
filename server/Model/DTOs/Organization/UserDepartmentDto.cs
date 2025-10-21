using System.ComponentModel.DataAnnotations;
using Model.Models;

namespace Model.DTOs.Organization;

public class UserDepartmentDto
{
    public int Id { get; set; }
    public long UserId { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; }
    public string? JobTitleCode { get; set; }
    public bool IsPrimary { get; set; }
}

public class DepartmentMemberDto
{
    public int Id { get; set; }
    public long UserId { get; set; }
    public string FullName { get; set; }
    public string UserName { get; set; }
    public string Avatar { get; set; }
}

public class AssignMemberDepartmentDto
{
    [Required] public long UserId { get; set; }

    [Required] public int DepartmentId { get; set; }
}

public class RemoveDepartmentAssignmentDto
{
    [Required] public long UserId { get; set; }

    [Required] public long DepartmentId { get; set; }
}

public class UserDepartmentFilterDto: PaginationRequest
{
    public int DepartmentId { get; set; }
    public bool IsShowSubMembers { get; set; }
}