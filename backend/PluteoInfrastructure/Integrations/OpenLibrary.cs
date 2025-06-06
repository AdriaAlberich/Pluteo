
using Newtonsoft.Json;
using Pluteo.Domain.Interfaces.Integrations;
using Pluteo.Domain.Models.Dto.Books;
using Pluteo.Domain.Models.Dto.Integrations.OpenLibrary;
using Pluteo.Domain.Models.Settings;
using RestSharp;

namespace Pluteo.Infrastructure.Integrations;
public class OpenLibrary(OpenLibrarySettings openLibrarySettings) : ILibraryIntegration
{

    private readonly string _apiUrl = openLibrarySettings.ApiUrl;
    private readonly string _coverApiUrl = openLibrarySettings.CoverApiUrl;

    /// <summary>
    /// Searches for books in the Open Library API using the provided search terms.
    /// </summary>
    /// <param name="searchTerms"></param>
    /// <param name="page"></param>
    /// <param name="pageSize"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    public async Task<BookSearchResults> Search(List<string> searchTerms, int page = 1, int pageSize = 10)
    {
        RestClient client = new(_apiUrl + "/search.json");

        RestRequest request = new();
        request.AddQueryParameter("q", string.Join("+", searchTerms));
        request.AddQueryParameter("fields", "title,author_name,isbn,publisher,publish_place,first_publish_year,number_of_pages_median,language");
        request.AddQueryParameter("page", page.ToString());
        request.AddQueryParameter("limit", pageSize.ToString());

        request.AddHeader("User-Agent", "PluteoPLM - alberichjaumeadria@gmail.com");

        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful)
        {
            var result = JsonConvert.DeserializeObject<OpenLibrarySearchResults>(response.Content ?? string.Empty);

            var books = result?.docs?.Select(doc => new BookSearchResult
            {
                Title = doc.title ?? string.Empty,
                ISBN = doc.isbn ?? [],
                Authors = doc.author_name ?? [],
                SearchCoverUrl = $"{_coverApiUrl}/b/isbn/{doc.isbn?.FirstOrDefault()}-M.jpg",
                Publishers = doc.publisher ?? [],
                PublishPlaces = doc.publish_place ?? [],
                FirstPublishYear = doc.first_publish_year.ToString() ?? string.Empty,
                NumPages = doc.number_of_pages_median ?? 0,
                AvailableLanguages = doc.language ?? []
            }).ToList() ?? [];

            var totalCount = result?.numFound ?? 0;
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var paginatedBooks = books.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            BookSearchResults searchResults = new()
            {
                TotalResults = totalCount,
                TotalPages = totalPages,
                Page = page,
                Results = paginatedBooks
            };

            return searchResults;
        }

        throw new Exception("Error fetching data from Open Library API.");
    }

    /// <summary>
    /// Fetches book details from the Open Library API using the provided ISBN.
    /// </summary>
    /// <param name="isbn"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    public async Task<CreateBookRequest> GetBookDetails(string isbn)
    {
        RestClient client = new(_apiUrl + "/search.json");

        RestRequest request = new();
        request.AddQueryParameter("q", isbn);
        request.AddQueryParameter("fields", "title,author_name,isbn,publisher,publish_place,first_publish_year,number_of_pages_median,language");
        request.AddQueryParameter("limit", "1");

        request.AddHeader("User-Agent", "PluteoPLM - alberichjaumeadria@gmail.com");
        
        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful)
        {
            var result = JsonConvert.DeserializeObject<OpenLibrarySearchResults>(response.Content ?? string.Empty);
            
            var coverBigUrl = $"{_coverApiUrl}/b/isbn/{result?.docs?.FirstOrDefault()?.isbn?.FirstOrDefault()}-L.jpg";
            var coverSmallUrl = $"{_coverApiUrl}/b/isbn/{result?.docs?.FirstOrDefault()?.isbn?.FirstOrDefault()}-M.jpg";

            var coverBigBase64 = await GetBase64FromUrl(coverBigUrl);
            var coverSmallBase64 = await GetBase64FromUrl(coverSmallUrl);

            CreateBookRequest bookRequest = new()
            {
                Title = result?.docs?.FirstOrDefault()?.title ?? string.Empty,
                ISBN = result?.docs?.FirstOrDefault()?.isbn ?? [],
                CoverBig = coverBigBase64,
                CoverSmall = coverSmallBase64,
                Authors = result?.docs?.FirstOrDefault()?.author_name ?? [],
                Publishers = result?.docs?.FirstOrDefault()?.publisher ?? [],
                PublishPlaces = result?.docs?.FirstOrDefault()?.publish_place ?? [],
                FirstPublishYear = result?.docs?.FirstOrDefault()?.first_publish_year.ToString() ?? string.Empty,
                NumPages = result?.docs?.FirstOrDefault()?.number_of_pages_median ?? 0,
                AvailableLanguages = result?.docs?.FirstOrDefault()?.language ?? []
            };

            return bookRequest;
        }

        throw new Exception("Error fetching data from Open Library API.");
    }

    /// <summary>
    /// Fetches the cover image from the provided URL and converts it to a base64 string.
    /// </summary>
    /// <param name="imageUrl"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    private static async Task<string> GetBase64FromUrl(string imageUrl)
    {
        RestClient client = new(imageUrl);
        RestRequest request = new();

        request.AddHeader("User-Agent", "PluteoPLM - alberichjaumeadria@gmail.com");

        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful && response.RawBytes != null)
        {
            var contentType = response.ContentType ?? "image/jpeg";

            var base64String = Convert.ToBase64String(response.RawBytes);

            return $"data:{contentType};base64,{base64String}";
        }

        throw new Exception("Error fetching data from Open Library API.");
    }
}
