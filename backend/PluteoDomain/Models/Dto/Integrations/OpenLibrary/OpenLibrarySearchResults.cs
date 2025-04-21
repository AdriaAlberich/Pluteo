namespace Pluteo.Domain.Models.Dto.Integrations.OpenLibrary;
public class OpenLibrarySearchResults
{
    public int numFound { get; set; }
    public int start { get; set; }
    public List<OpenLibrarySearchResult>? docs { get; set; }
}