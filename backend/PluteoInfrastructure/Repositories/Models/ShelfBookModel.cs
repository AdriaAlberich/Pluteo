using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Pluteo.Domain.Enums;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Infrastructure.Repositories.Models;
public class ShelfBookModel
{
    [BsonId]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public required Guid Id { get; set; }
    [BsonElement("Title")]
    [BsonRequired]
    public required string Title { get; set; }
    [BsonElement("Status")]
    [BsonRequired]
    public required ShelfBookStatus Status { get; set; }
    [BsonElement("Order")]
    [BsonRequired]
    public required int Order { get; set; }
    [BsonElement("ISBN")]
    [BsonRequired]
    public required List<string> ISBN { get; set; }
    [BsonElement("Book")]
    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    [BsonRequired]
    public Guid? Book { get; set; }
    [BsonElement("CoverBig")]
    [BsonRequired]
    public string? CoverBig { get; set; }
    [BsonElement("CoverSmall")]
    [BsonRequired]
    public string? CoverSmall { get; set; }
    [BsonElement("Authors")]
    [BsonRequired]
    public required List<string> Authors { get; set; }
    [BsonElement("Publisher")]
    [BsonRequired]
    public required List<string> Publisher { get; set; }
    [BsonElement("PublishPlace")]
    [BsonRequired]
    public required List<string> PublishPlace { get; set; }
    [BsonElement("FirstPublishYear")]
    [BsonRequired]
    public required string FirstPublishYear { get; set; }
    [BsonElement("NumPages")]
    [BsonRequired]
    public required int NumPages { get; set; }
    [BsonElement("AvailableLanguages")]
    [BsonRequired]
    public required List<string> AvailableLanguages { get; set; }
    [BsonElement("Notes")]
    [BsonRequired]
    public required string Notes { get; set; }
    [BsonElement("PhysicalLocation")]
    [BsonRequired]
    public required string PhysicalLocation { get; set; }
    [BsonElement("Loan")]
    public LibraryLoan? Loan { get; set; }
    [BsonElement("Ebook")]
    public Ebook? Ebook { get; set; }
}
