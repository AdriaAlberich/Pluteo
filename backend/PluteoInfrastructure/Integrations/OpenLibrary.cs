

using Newtonsoft.Json;
using Pluteo.Domain.Exceptions;
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

    public async Task<BookSearchResults> Search(List<string> searchTerms, int page = 1, int pageSize = 10)
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

            var books = result?.docs?.Select(doc => new BookSearchResult
            {
                Title = doc.title ?? string.Empty,
                ISBN = doc.isbn ?? [],
                Authors = doc.author_name ?? [],
                SearchCoverUrl = $"{_coverApiUrl}/b/id/{doc.isbn?.FirstOrDefault()}-M.jpg",
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
