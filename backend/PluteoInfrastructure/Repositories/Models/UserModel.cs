using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Pluteo.Domain.Models.Entities;

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
    public required List<Notification> Notifications { get; set; }
    [BsonElement("Settings")]
    [BsonRequired]
    public required UserSettings Settings { get; set; }
    [BsonElement("ActivationToken")]
    public string? ActivationToken { get; set; }
    [BsonElement("ResetPasswordToken")]
    public string? ResetPasswordToken { get; set; }
}
