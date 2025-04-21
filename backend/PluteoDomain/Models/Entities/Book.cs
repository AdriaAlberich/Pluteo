namespace Pluteo.Domain.Models.Entities;
public class Book
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required List<string> ISBN { get; set; }
    public required string CoverBig { get; set; }
    public required string CoverSmall { get; set; }
    public required List<string> Authors { get; set; }
    public required List<string> Publishers { get; set; }
    public required List<string> PublishPlaces { get; set; }
    public required string FirstPublishYear { get; set; }
    public required int NumPages { get; set; }
    public required List<string> AvailableLanguages { get; set; }
}