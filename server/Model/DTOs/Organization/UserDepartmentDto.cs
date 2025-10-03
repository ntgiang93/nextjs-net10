using System.ComponentModel.DataAnnotations;

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
    public string UserFullName { get; set; }
    public string? JobTitleCode { get; set; }
    public bool IsPrimary { get; set; }
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

public class UserDepartmentFilterDto
{
    public int? DepartmentId { get; set; }

    public string? SearchTerm { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}