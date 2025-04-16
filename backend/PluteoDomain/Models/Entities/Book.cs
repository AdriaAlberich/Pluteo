namespace Pluteo.Domain.Models.Entities;
public class Book
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required string ISBN { get; set; }
    public required string Cover { get; set; }
    public required List<string> Authors { get; set; }
    public required List<string> Tags { get; set; }
    public required List<string> Publishers { get; set; }
    public required DateTime PublishDate { get; set; }
    public required int NumPages { get; set; }
    public required bool HasEbook { get; set; }
}