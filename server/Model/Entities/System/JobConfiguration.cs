using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities.System;

[Table("JobConfigurations")]
public class JobConfiguration: BaseEntity<int>
{
    [Required]
    [MaxLength(200)]
    public string JobName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string JobGroup { get; set; } = "DEFAULT";
    
    [Required]
    [MaxLength(500)]
    public string JobType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string CronExpression { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    /// <summary>
    /// JSON string of job data
    /// </summary>
    public string? JobDataJson { get; set; }
    
}

