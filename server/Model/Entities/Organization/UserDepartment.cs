using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

namespace Model.Entities.Organization;

[Table("UserDepartments")]
public class UserDepartment : BaseEntity<int>
{
    [Required] public required string UserId { get; set; }

    [Required] public int DepartmentId { get; set; }
}