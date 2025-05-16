namespace Pluteo.Domain.Models.Dto.Books;
public class BookSearchResults
{
    public required int TotalResults { get; set; }
    public required int Page { get; set; }
    public required int TotalPages { get; set; }
    public required List<BookSearchResult> Results { get; set; }
}
