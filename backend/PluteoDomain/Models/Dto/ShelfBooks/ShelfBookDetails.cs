using Pluteo.Domain.Enums;

namespace Pluteo.Domain.Models.Dto.ShelfBooks;
public class ShelfBookDetails
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required ShelfBookStatus Status { get; set; }
    public int? Order { get; set; }
    public string? ISBN { get; set; }
    public string? Cover { get; set; }
    public string? Authors { get; set; }
    public string? Publisher { get; set; }
    public string? PublishPlace { get; set; }
    public string? FirstPublishYear { get; set; }
    public int? NumPages { get; set; }
    public string? AvailableLanguages { get; set; }
    public string? Notes { get; set; }
    public string? PhysicalLocation { get; set; }
}