using Pluteo.Domain.Enums;

namespace Pluteo.Domain.Models.Entities;
public class ShelfBook
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required ShelfBookStatus Status { get; set; }
    public required int Order { get; set; }
    public required List<string> ISBN { get; set; }
    public Guid? Book { get; set; }
    public required string CoverBig { get; set; }
    public required string CoverSmall { get; set; }
    public required List<string> Authors { get; set; }
    public required List<string> Publisher { get; set; }
    public required List<string> PublishPlace { get; set; }
    public required string FirstPublishYear { get; set; }
    public required int NumPages { get; set; }
    public required List<string> AvailableLanguages { get; set; }
    public required string Notes { get; set; }
    public required string PhysicalLocation { get; set; }
    public LibraryLoan? Loan { get; set; }
    public Ebook? Ebook { get; set; }
}