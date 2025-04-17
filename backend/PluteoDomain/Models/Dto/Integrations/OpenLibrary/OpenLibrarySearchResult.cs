namespace Pluteo.Domain.Models.Dto.Integrations.OpenLibrary;
public class OpenLibrarySearchResult
{
    public string? title { get; set; }
    public List<string>? isbn { get; set; }
    public List<string>? author_name { get; set; }
    public List<string>? publish_place { get; set; }
    public List<string>? publisher { get; set; }
    public int? first_publish_year { get; set; }
    public int? number_of_pages_median { get; set; }
    public required List<string> language { get; set; }
}