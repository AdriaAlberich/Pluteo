namespace Pluteo.Domain.Models.Dto.Books;
public class UpdateBookRequest
{
    public string? Title { get; set; }
    public List<string>? ISBN { get; set; }
    public string? CoverBig { get; set; }
    public string? CoverSmall { get; set; }
    public List<string>? Authors { get; set; }
    public List<string>? Publishers { get; set; }
    public List<string>? PublishPlaces { get; set; }
    public string? FirstPublishYear { get; set; }
    public int NumPages { get; set; }
    public List<string>? AvailableLanguages { get; set; }
}
