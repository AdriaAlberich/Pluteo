namespace Pluteo.Domain.Models.Dto.ShelfBooks;
public class ShelfBookOverview
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public int? Order { get; set; }
    public string? Cover { get; set; }
}