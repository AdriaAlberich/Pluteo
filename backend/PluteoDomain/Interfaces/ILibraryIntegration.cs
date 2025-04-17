using Pluteo.Domain.Models.Dto.Books;

namespace Pluteo.Domain.Interfaces;
public interface ILibraryIntegration
{
    Task<List<BookSearchResult>> Search(List<string> searchTerms, int page = 1, int pageSize = 10);
    Task<CreateBookRequest> GetBookDetails(string isbn);
}