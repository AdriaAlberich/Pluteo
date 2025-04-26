using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Pluteo.Infrastructure.Repositories.Models;
public class BookModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public required Guid Id { get; set; }
    [BsonElement("Title")]
    [BsonRequired]
    public required string Title { get; set; }
    [BsonElement("ISBN")]
    [BsonRequired]
    public required List<string> ISBN { get; set; }
    [BsonElement("CoverBig")]
    [BsonRequired]
    public required string CoverBig { get; set; }
    [BsonElement("CoverSmall")]
    [BsonRequired]
    public required string CoverSmall { get; set; }
    [BsonElement("Authors")]
    [BsonRequired]
    public required List<string> Authors { get; set; }
    [BsonElement("Publishers")]
    [BsonRequired]
    public required List<string> Publishers { get; set; } 
    [BsonElement("PublishPlaces")]
    [BsonRequired]
    public required List<string> PublishPlaces { get; set; }
    [BsonElement("FirstPublishYear")]
    [BsonRequired]
    public required string FirstPublishYear { get; set; }
    [BsonElement("NumPages")]
    [BsonRequired]
    public required int NumPages { get; set; }
    [BsonElement("AvailableLanguages")]
    [BsonRequired]
    public required List<string> AvailableLanguages { get; set; }
}
