

using Newtonsoft.Json;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Dto.Books;
using Pluteo.Domain.Models.Dto.Integrations.OpenLibrary;
using Pluteo.Domain.Models.Settings;
using RestSharp;

namespace Pluteo.Infrastructure.Integrations;
public class OpenLibrary(OpenLibrarySettings openLibrarySettings) : ILibraryIntegration
{

    private readonly string _apiUrl = openLibrarySettings.ApiUrl;
    private readonly string _coverApiUrl = openLibrarySettings.CoverApiUrl;

    public async Task<List<BookSearchResult>> Search(List<string> searchTerms, int page = 1, int pageSize = 10)
    {
        RestClient client = new(_apiUrl + "/search.json");

        RestRequest request = new();
        request.AddQueryParameter("q", string.Join("+", searchTerms));
        request.AddQueryParameter("fields", "title,author_name,isbn,publisher,publish_place,first_publish_year,subject,number_of_pages,languages");
        request.AddQueryParameter("page", page.ToString());
        request.AddQueryParameter("limit", pageSize.ToString());

        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful)
        {
            var result = JsonConvert.DeserializeObject<OpenLibrarySearchResults>(response.Content ?? string.Empty);
            return result?.docs?.Select(d => new BookSearchResult
            {
                Title = d.title ?? string.Empty,
                ISBN = d.isbn ?? [],
                SearchCoverUrl = $"{_coverApiUrl}/b/id/{d.isbn?.FirstOrDefault()}-M.jpg",
                Authors = d.author_name ?? [],
                Publishers = d.publisher ?? [],
                PublishPlaces = d.publish_place ?? [],
                FirstPublishYear = d.first_publish_year?.ToString() ?? string.Empty,
                NumPages = d.number_of_pages_median ?? 0,
                AvailableLanguages = d.language ?? []
            }).ToList() ?? [];
        }

        throw new Exception("Error fetching data from Open Library API.");
    }

    public async Task<CreateBookRequest> GetBookDetails(string isbn)
    {
        RestClient client = new(_apiUrl + "/search.json");

        RestRequest request = new();
        request.AddQueryParameter("q", isbn);
        request.AddQueryParameter("fields", "title,author_name,isbn,publisher,publish_place,first_publish_year,subject,number_of_pages,languages");

        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful)
        {
            var result = JsonConvert.DeserializeObject<OpenLibrarySearchResults>(response.Content ?? string.Empty);
            
            var coverBigUrl = $"{_coverApiUrl}/b/id/{result?.docs?.FirstOrDefault()?.isbn?.FirstOrDefault()}-L.jpg";
            var coverSmallUrl = $"{_coverApiUrl}/b/id/{result?.docs?.FirstOrDefault()?.isbn?.FirstOrDefault()}-M.jpg";

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

    private static async Task<string> GetBase64FromUrl(string coverBigUrl)
    {
        RestClient client = new(coverBigUrl);
        RestRequest request = new();
        var response = await client.ExecuteAsync(request);
        if (response.IsSuccessful)
        {
            return Convert.ToBase64String(response.RawBytes ?? []);
        }

        throw new Exception("Error fetching data from Open Library API.");
    }
}
