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
    public required string ISBN { get; set; }
    [BsonElement("Cover")]
    [BsonRequired]
    public required string Cover { get; set; }
    [BsonElement("Authors")]
    [BsonRequired]
    public required List<string> Authors { get; set; }
    [BsonElement("Tags")]
    [BsonRequired]
    public required List<string> Tags { get; set; }
    [BsonElement("Publishers")]
    [BsonRequired]
    public required List<string> Publishers { get; set; }
    [BsonElement("PublishDate")]
    [BsonRequired]
    public required DateTime PublishDate { get; set; }
    [BsonElement("NumPages")]
    [BsonRequired]
    public required int NumPages { get; set; }
    [BsonElement("HasEbook")]
    [BsonRequired]
    public required bool HasEbook { get; set; }
}
