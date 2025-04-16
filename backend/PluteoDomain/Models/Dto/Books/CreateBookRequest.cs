namespace Pluteo.Domain.Models.Dto.Books;
public class CreateBookRequest
{
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
