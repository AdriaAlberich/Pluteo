using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Pluteo.Infrastructure.Repositories.Models;
public class ShelfModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public required Guid Id { get; set; }
    [BsonElement("Name")]
    [BsonRequired]
    public required string Name { get; set; }
    [BsonElement("IsDefault")]
    [BsonRequired]
    public required bool IsDefault { get; set; }
    [BsonElement("IsReadQueue")]
    [BsonRequired]
    public required bool IsReadQueue { get; set; }
    [BsonElement("Order")]
    [BsonRequired]
    public required int Order { get; set; }
    [BsonElement("Books")]
    [BsonRequired]
    public required List<ShelfBookModel> Books { get; set; }
}
