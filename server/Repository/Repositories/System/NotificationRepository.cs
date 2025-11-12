using Common.Extensions;
using Dapper;
using Mapster;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.Entities.System;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using SqlKata;

namespace Repository.Repositories.System;

public class NotificationRepository : GenericRepository<Notification, int>, INotificationRepository
{
    private readonly string _table = StringHelper.GetTableName<Notification>();
    public NotificationRepository(IDbConnectionFactory dbFactory) : base(dbFactory)
    {
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var query = new Query(_table).Where(nameof(Notification.IsRead), false)
            .Where(nameof(Notification.IsDeleted), false)
            .Where(nameof(Notification.UserId), userId)
            .AsCount();
        var queryComplied = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var count = await connection.ExecuteScalarAsync<int>(queryComplied.Sql, queryComplied.NamedBindings);
        return count;
    }

    public async Task<CursorPaginatedResultDto<NotificationDto, DateTime>> GetUserNotificationsAsync(NotificationsFilterDto filter)
    {
        var query = new Query(_table).Where(nameof(Notification.IsRead), filter.IsRead)
            .Where(nameof(Notification.IsDeleted), false)
            .Where(nameof(Notification.UserId), filter.UserId)
            .Where(nameof(Notification.CreatedAt), "<", filter.Cursor ?? DateTime.Now)
            .OrderByDesc(nameof(Notification.CreatedAt))
            .Limit(51);
        var queryComplied = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var notifications = await connection.QueryAsync<Notification>(queryComplied.Sql, queryComplied.NamedBindings);
        var reuslt = new CursorPaginatedResultDto<NotificationDto, DateTime>();
        var enumerable = notifications.ToList();
        reuslt.HasMore = enumerable.Count() > 50;
        reuslt.Items = enumerable.Adapt<List<NotificationDto>>().Take(50).ToList();
        reuslt.NextCursor = enumerable.LastOrDefault()?.CreatedAt ?? default;
        return reuslt;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var query = new Query(_table)
            .Where(nameof(Notification.UserId), userId)
            .Where(nameof(Notification.IsRead), false)
            .Where(nameof(Notification.IsDeleted), false).AsUpdate(new
            {
                IsRead = true
            });
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var rowsAffected = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);
        return rowsAffected > 0;
    }

    public async Task<bool> BulkCreateAsync(List<CreateNotificationDto> notifications, string createdBy)
    {
        var cols = new[] {
            nameof(Notification.UserId),
            nameof(Notification.Title),
            nameof(Notification.Type),
            nameof(Notification.Link),
            nameof(Notification.Metadata),
            nameof(Notification.Message),
            nameof(Notification.IsRead),
            nameof(Notification.CreatedAt),
            nameof(Notification.CreatedBy),
        };

        var data = notifications.Select(n => new object[]
        {
            n.UserId,
            n.Title,
            n.Type,
            n.Link ?? string.Empty,
            n.Metadata ?? string.Empty,
            n.Message,
            false,
            DateTime.Now,
            createdBy
        }).ToArray();
        var query = new Query(_table).AsInsert(cols, data);
        var compiledQuery = _compiler.Compile(query);
        var connection = _dbFactory.Connection;
        var excuted = await connection.ExecuteAsync(compiledQuery.Sql, compiledQuery.NamedBindings);
        return excuted > 0;
    }
}

