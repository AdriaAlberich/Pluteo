using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Interfaces.Integrations;
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

    /// <summary>
    /// Adds a new notification to the user.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="title"></param>
    /// <param name="content"></param>
    /// <param name="markAsRead"></param>
    /// <returns></returns>
    public async Task AddNotification(User user, string title, string content, bool markAsRead = false)
    {
        // Check if the user has reached the max notification number and remove the oldest
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

        // Send email notification depending on the user's settings
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

    /// <summary>
    /// Returns the list of notifications for a user.
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns>
    public async Task<List<Notification>> GetNotificationList(User user)
    {
        await SortNotifications(user);

        return user.Notifications;
    }

    /// <summary>
    /// Handles the click on a notification.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="notificationId"></param>
    /// <returns></returns>
    public async Task NotificationClick(User user, Guid notificationId)
    {
        Notification? notification = user.Notifications.Find(x => x.NotificationId == notificationId);

        if(notification == null)
            return;

        notification.MarkedAsRead = true;

        await _userService.Update(user);

        _logger.Information("User {Email} ({Id}) has clicked on notification: {Title}", user.Email, user.Id, notification.Title);
    }

    /// <summary>
    /// Removes a notification from the user.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="notificationId"></param>
    /// <returns></returns>
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

    /// <summary>
    /// Removes all notifications from the user (controller call).
    /// </summary>
    /// <param name="email"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task<List<Notification>> GetUserNotifications(string email)
    {
        User? user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_FOUND");

        return await GetNotificationList(user);
    }

    /// <summary>
    /// Handles the click on a notification (controller call).
    /// </summary>
    /// <param name="email"></param>
    /// <param name="notificationId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task NotificationUserClick(string email, Guid notificationId)
    {
        User? user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_FOUND");

        await NotificationClick(user, notificationId);
    }

    /// <summary>
    /// Removes a notification from the user (controller call).
    /// </summary>
    /// <param name="email"></param>
    /// <param name="notificationId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task RemoveUserNotification(string email, Guid notificationId)
    {
        User? user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_FOUND");

        await RemoveNotification(user, notificationId);
    }

    /// <summary>
    /// Removes all notifications from the user (controller call).
    /// </summary>
    /// <param name="email"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task RemoveUserNotifications(string email)
    {
        User? user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_FOUND");

        await RemoveAllNotifications(user);
    }
    
    /// <summary>
    /// Removes all notifications from the user.
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns>
    public async Task RemoveAllNotifications(User user)
    {
        user.Notifications.Clear(); 
        await _userService.Update(user);
    }

    /// <summary>
    /// Sorts the notifications of a user by timestamp (latest first).
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns>
    public async Task SortNotifications(User user)
    {
        await Task.Run(() => { user.Notifications.Sort((x, y) => y.Timestamp.CompareTo(x.Timestamp)); });
    }
}
