using Model.DTOs.Base;
using Model.DTOs.System;
using Model.Entities.System;
using Repository.Interfaces.Base;

namespace Repository.Interfaces.System;

public interface INotificationRepository : IGenericRepository<Notification, int>
{
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
    Task<CursorPaginatedResultDto<NotificationDto, DateTime>> GetUserNotificationsAsync(NotificationsFilterDto filter);
    Task<bool> BulkCreateAsync(List<CreateNotificationDto> notifications, string createdBy);
}

