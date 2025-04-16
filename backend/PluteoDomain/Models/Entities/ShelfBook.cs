using Pluteo.Domain.Enums;

namespace Pluteo.Domain.Models.Entities;
public class ShelfBook
{
    public required Guid Id { get; set; }
    public required string Title { get; set; }
    public required ShelfBookStatus Status { get; set; }
    public required int Order { get; set; }
    public string? ISBN { get; set; }
    public Guid? Book { get; set; }
    public string? Cover { get; set; }
    public string? Authors { get; set; }
    public List<string>? Tags { get; set; }
    public DateTime? PublishDate { get; set; }
    public int? NumPages { get; set; }
    public string? Notes { get; set; }
    public string? PhysicalLocation { get; set; }
    public LibraryLoan? Loan { get; set; }
    public Ebook? Ebook { get; set; }
}