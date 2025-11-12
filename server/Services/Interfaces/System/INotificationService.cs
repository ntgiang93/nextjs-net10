using Model.DTOs.Base;
using Model.DTOs.System;
using Model.Entities.System;
using Service.Interfaces.Base;

namespace Services.Interfaces.System;

public interface INotificationService : IGenericService<Notification, int>
{
    /// <summary>
    /// Retrieves a cursor-paginated list of notifications for a user according to the provided filter.
    /// </summary>
    /// <param name="filter">Filter containing UserId, Cursor, IsRead and pagination options.</param>
    /// <returns>Cursor-paginated result containing NotificationDto items and the next cursor.</returns>
    Task<CursorPaginatedResultDto<NotificationDto, DateTime>> GetUserNotificationsAsync(NotificationsFilterDto filter);

    /// <summary>
    /// Gets the unread notification count for the specified user.
    /// </summary>
    /// <param name="userId">The identifier of the user (as string) whose unread count will be returned.</param>
    /// <returns>Number of unread notifications for the user.</returns>
    Task<int> GetUnreadCountAsync(string userId);

    /// <summary>
    /// Creates a single notification from the provided DTO.
    /// </summary>
    /// <param name="dto">CreateNotificationDto containing notification data.</param>
    /// <returns>True when creation succeeded; otherwise false.</returns>
    Task<bool> CreateNotificationAsync(CreateNotificationDto dto);

    /// <summary>
    /// Marks a single notification as read.
    /// </summary>
    /// <param name="notificationId">Id of the notification to mark as read.</param>
    /// <returns>True when the update succeeded or notification already read/missing; otherwise false.</returns>
    Task<bool> MarkAsReadAsync(int notificationId);

    /// <summary>
    /// Marks all notifications for the specified user as read.
    /// </summary>
    /// <param name="userId">The identifier of the user (as string) whose notifications will be marked read.</param>
    /// <returns>True when one or more notifications were updated; otherwise false.</returns>
    Task<bool> MarkAllAsReadAsync(string userId);

    /// <summary>
    /// Soft-deletes a notification by id.
    /// </summary>
    /// <param name="id">The id of the notification to delete.</param>
    /// <returns>True when deletion succeeded; otherwise false.</returns>
    Task<bool> DeleteNotificationAsync(int id);

    /// <summary>
    /// Creates multiple notifications in bulk. The implementation is expected to set CreatedAt and CreatedBy.
    /// </summary>
    /// <param name="notifications">List of CreateNotificationDto to insert.</param>
    /// <returns>True when bulk insert succeeded; otherwise false.</returns>
    Task<bool> BulkCreateNotificationsAsync(List<CreateNotificationDto> notifications);
}
