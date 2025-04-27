using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Infrastructure.Repositories.Models;
public class UserSettingsModel
{
    [BsonRequired]
    [BsonElement("NotifyByEmail")]
    public required bool NotifyByEmail { get; set; }
    [BsonRequired]
    [BsonElement("NotifyLoan")]
    public required bool NotifyLoan { get; set; }
    [BsonRequired]
    [BsonElement("NotifyLoanBeforeDays")]
    public required int NotifyLoanBeforeDays { get; set; }
    [BsonRequired]
    [BsonElement("NotifyLoanBeforeDaysFrequency")]
    public required int NotifyLoanBeforeDaysFrequency { get; set; }
    [BsonRequired]
    [BsonElement("Locale")]
    public required string Locale { get; set; }
}
