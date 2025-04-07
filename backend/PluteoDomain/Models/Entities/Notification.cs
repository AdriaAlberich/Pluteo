namespace Pluteo.Domain.Models.Entities;
public class Notification
{
    public required Guid NotificationId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required bool MarkedAsRead { get; set; }
    public DateTime Timestamp { get; set; }
}
