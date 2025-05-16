using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Pluteo.Infrastructure.Repositories.Models;
public class NotificationModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public required Guid NotificationId { get; set; }
    [BsonElement("Title")]
    [BsonRequired]
    public required string Title { get; set; }
    [BsonElement("Content")]
    [BsonRequired]
    public required string Content { get; set; }
    [BsonElement("MarkedAsRead")]
    [BsonRequired]
    public required bool MarkedAsRead { get; set; }
    [BsonElement("Timestamp")]
    [BsonRequired]
    public DateTime Timestamp { get; set; }
}
