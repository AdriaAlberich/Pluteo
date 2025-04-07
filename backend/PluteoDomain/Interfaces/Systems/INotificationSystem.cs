using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface INotificationSystem
{
    Task AddNotification(User user, string title, string content, bool markAsRead = false);
    Task<List<Notification>> GetNotificationList(User user);
    Task RemoveNotification(User character, Guid notificationId);
    Task NotificationClick(User character, Guid notificationId);
}
