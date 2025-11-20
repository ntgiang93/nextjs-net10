using Common.Security;
using Common.Security.Policies;
using Common.Security.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System;
using Service.Interfaces.Base;
using Services.Interfaces.System;

namespace Controllers.Controllers.System;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ISysMessageService _sysMsg;

    public NotificationController(
        INotificationService notificationService,
        ISysMessageService sysMsg)
    {
        _notificationService = notificationService;
        _sysMsg = sysMsg;
    }

    [HttpGet("my-notifications")]
    public async Task<IActionResult> GetMyNotifications([FromQuery] NotificationsFilterDto filter)
    {
        var userId = UserContext.Current.UserId;
        filter.UserId = userId;
        var result = await _notificationService.GetUserNotificationsAsync(filter);
        return Ok(ApiResponse<CursorPaginatedResultDto<NotificationDto, DateTime>>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = UserContext.Current.UserId;
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(ApiResponse<int>.Succeed(count, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var currentUser = UserContext.Current;
        var notification = await _notificationService.GetSingleAsync<NotificationDto>(n => n.Id == id && n.UserId == currentUser.UserId && n.IsDeleted == false);
        if (notification == null)
            return NotFound(ApiResponse<NotificationDto>.Fail(_sysMsg.Get(EMessage.Error404Msg)));

        return Ok(ApiResponse<NotificationDto>.Succeed(notification, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPost("filter")]
    public async Task<IActionResult> GetFiltered([FromBody] NotificationsFilterDto filter)
    {
        var result = await _notificationService.GetUserNotificationsAsync(filter);
        return Ok(ApiResponse<CursorPaginatedResultDto<NotificationDto, DateTime>>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));
    }

    [HttpPatch("{id}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        if (result)
            return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));

        return NotFound(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
    }

    [HttpPatch("mark-all-as-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = UserContext.Current.UserId;
        var result = await _notificationService.MarkAllAsReadAsync(userId);
        if (result)
            return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));

        return BadRequest(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.FailureMsg)));
    }

    [HttpDelete()]
    public async Task<IActionResult> Delete([FromBody] List<int> ids)
    {
        if (ids.Count == 0)
            return BadRequest(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.Error400Msg)));

        var result = await _notificationService.BulkDeleteNotificationsAsync(ids);
        if (result)
            return Ok(ApiResponse<bool>.Succeed(result, _sysMsg.Get(EMessage.SuccessMsg)));

        return NotFound(ApiResponse<bool>.Fail(_sysMsg.Get(EMessage.Error404Msg)));
    }
}
