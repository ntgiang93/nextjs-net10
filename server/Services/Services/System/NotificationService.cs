using Common.Security;
using Common.Security.User;
using Mapster;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.Entities.System;
using Repository.Interfaces.System;
using Service.Services.Base;
using Services.Interfaces.System;

namespace Services.Services.System;

public class NotificationService : GenericService<Notification, int>,INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository, IServiceProvider serviceProvider):base(notificationRepository, serviceProvider)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<CursorPaginatedResultDto<NotificationDto,DateTime>> GetUserNotificationsAsync(
        NotificationsFilterDto filter)
    {
        return await _notificationRepository.GetUserNotificationsAsync(filter);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task<bool> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var notification = dto.Adapt<Notification>();
        notification.IsRead = false;
        var id = await CreateAsync(notification);
        return id > 0;
    }
    
    public async Task<bool> MarkAsReadAsync(int notificationId)
    {
        var noti = await GetSingleAsync<Notification>(n => n.IsDeleted == false && n.Id == notificationId && n.IsRead == false);
        if (noti == null) return true;
        else
        {
            noti.IsRead = true;
            return await UpdateAsync(noti);
        }
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        return await _notificationRepository.MarkAllAsReadAsync(userId);
    }

    public async Task<bool> DeleteNotificationAsync(int id)
    {
        return await SoftDeleteAsync(id);
    }

    public async Task<bool> BulkCreateNotificationsAsync(List<CreateNotificationDto> notifications)
    {
        var currentUser = UserContext.Current;
        return await _notificationRepository.BulkCreateAsync(notifications, currentUser.UserName);
    }
}


