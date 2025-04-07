using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface INotificationSystem
{
    Task AddNotification(User user, string title, string content, bool markAsRead = false);
    Task<List<Notification>> GetNotificationList(User user);
    Task RemoveNotification(User user, Guid notificationId);
    Task NotificationClick(User user, Guid notificationId);
    Task SortNotifications(User user);
    Task<List<Notification>> GetUserNotifications(string email);
    Task NotificationUserClick(string email, Guid notificationId);
    Task RemoveUserNotification(string email, Guid notificationId);
    Task RemoveUserNotifications(string email);
}
