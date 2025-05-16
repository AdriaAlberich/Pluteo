using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Pluteo.Infrastructure.Repositories.Models;
public class UserModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public required Guid Id { get; set; }
    [BsonElement("Email")]
    [BsonRequired]
    public required string Email { get; set; }
    [BsonElement("Password")]
    [BsonRequired]
    public required string Password { get; set; }
    [BsonElement("Roles")]
    [BsonRequired]
    public required List<string> Roles { get; set; }
    [BsonElement("Notifications")]
    [BsonRequired]
    public required List<NotificationModel> Notifications { get; set; }
    [BsonElement("Settings")]
    [BsonRequired]
    public required UserSettingsModel Settings { get; set; }
    [BsonElement("Shelves")]
    [BsonRequired]
    public required List<ShelfModel> Shelves { get; set; }
    [BsonElement("ActivationToken")]
    [BsonRequired]
    public string? ActivationToken { get; set; }
    [BsonElement("ResetPasswordToken")]
    [BsonRequired]
    public string? ResetPasswordToken { get; set; }
}
