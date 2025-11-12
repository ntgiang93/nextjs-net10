using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Model.Constants;

namespace Model.Entities.System;

[Table("Notifications")]
public class Notification : BaseEntity<int>
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    
    [MaxLength(500)]
    public string? Link { get; set; }
    
    public bool IsRead { get; set; } = false;
    
    public DateTime? ReadAt { get; set; }
    
    [Required]
    public string UserId { get; set; }
    [MaxLength(500)]
    public string? Metadata { get; set; } // JSON string for additional data
}

