using Pluteo.Application.Services;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Application.Systems;
public class NotificationSystem(ApplicationSettings config, UserService userService, ILogger logger, IEmailSender emailSender, IResourceManager localizationManager) : INotificationSystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly ILogger _logger = logger;
    private readonly IEmailSender _emailSender = emailSender;
    private readonly IResourceManager _localizationManager = localizationManager;

    public async Task AddNotification(User user, string title, string content, bool markAsRead = false)
    {
        if(user.Notifications.Count >= _config.UserMaxNotifications)
            user.Notifications.Remove(user.Notifications.Last());

        Notification newNotification = new() 
        {
            NotificationId = Guid.NewGuid(),
            Title = title,
            Content = content,
            MarkedAsRead = markAsRead,
            Timestamp = DateTime.UtcNow
        };

        user.Notifications.Add(newNotification);

        await SortNotifications(user);

        await _userService.Update(user);

        if(user.Settings.NotifyByEmail && !markAsRead)
        {
            Dictionary<string,string> dynamicFields = new()
            {
                { "notification_title", title },
                { "notification_content", content }
            };

            await _emailSender.SendEmail(_localizationManager.GetStringFormatted(user.Settings.Locale, "UserNotificationEmailSubject", _config.ApplicationName), $"notification_{user.Settings.Locale}", user.Email, dynamicFields);
        }

        _logger.Information("User {Email} ({Id}) has received a new notification: {Title}", user.Email, user.Id, title);
    }

    public async Task<List<Notification>> GetNotificationList(User user)
    {
        await SortNotifications(user);

        return user.Notifications;
    }

    public async Task NotificationClick(User user, Guid notificationId)
    {
        Notification? notification = user.Notifications.Find(x => x.NotificationId == notificationId);

        if(notification == null)
            return;

        notification.MarkedAsRead = true;

        await _userService.Update(user);

        _logger.Information("User {Email} ({Id}) has clicked on notification: {Title}", user.Email, user.Id, notification.Title);
    }

    public async Task RemoveNotification(User user, Guid notificationId)
    {
        await Task.Run(() => {
            Notification? notification = user.Notifications.Find(x => x.NotificationId == notificationId);

            if(notification != null)
            {
                user.Notifications.Remove(notification);
                _logger.Information("User {Email} ({Id}) has removed notification: {Title}", user.Email, user.Id, notification.Title);
            }
            else
            {
                _logger.Warning("User {Email} ({Id}) tried to remove a non-existing notification: {NotificationId}", user.Email, user.Id, notificationId);
            }
        });
    }

    public async Task SortNotifications(User user)
    {
        await Task.Run(() => { user.Notifications.Sort((x, y) => y.Timestamp.CompareTo(x.Timestamp)); });
    }
}
