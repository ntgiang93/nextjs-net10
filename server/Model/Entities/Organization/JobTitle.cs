using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Entities.System;

namespace Model.Entities.Organization;

[Table("JobTitles")]
public class JobTitle : BaseEntity<int>
{
    [Required] [StringLength(50)] public string Code { get; set; }

    [Required] [StringLength(200)] public string Name { get; set; }

    [StringLength(500)] public string Description { get; set; }

    public bool IsActive { get; set; } = true;
}