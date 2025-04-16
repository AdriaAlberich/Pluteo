namespace Pluteo.Domain.Models.Dto.Books;
public class UpdateBookRequest
{
    public string? Title { get; set; }
    public string? ISBN { get; set; }
    public string? Cover { get; set; }
    public List<string>? Authors { get; set; }
    public List<string>? Tags { get; set; }
    public List<string>? Publishers { get; set; }
    public DateTime? PublishDate { get; set; }
    public int? NumPages { get; set; }
    public bool? HasEbook { get; set; }
}
