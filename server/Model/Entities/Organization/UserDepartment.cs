using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

namespace Model.Entities.Organization;

[Table("UserDepartments")]
public class UserDepartment : BaseEntity<int>
{
    [Required] public long UserId { get; set; }

    [Required] public int DepartmentId { get; set; }

    [MaxLength(50)] public string JobTitleCode { get; set; }

    /// <summary>
    ///     true if this is the primary department for the user, false otherwise.
    /// </summary>
    public bool IsPrimary { get; set; } = true;
}