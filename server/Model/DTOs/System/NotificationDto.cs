using Model.Constants;

namespace Model.DTOs.System;

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public required string UserId { get; set; }
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? Link { get; set; }
    public required string UserId { get; set; }
    public string? Metadata { get; set; }
}

public class MarkNotificationAsReadDto
{
    public int Id { get; set; }
}

public class MarkAllAsReadDto
{
    public required string UserId { get; set; }
}

public class NotificationSummaryDto
{
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
    public int ReadCount { get; set; }
}

public class NotificationsFilterDto
{
    public bool IsRead { get; set; }
    public string? UserId { get; set; }
    public DateTime? Cursor { get; set; }
}