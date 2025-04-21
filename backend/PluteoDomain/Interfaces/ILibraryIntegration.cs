using Pluteo.Domain.Models.Dto.Books;

namespace Pluteo.Domain.Interfaces;
public interface ILibraryIntegration
{
    Task<BookSearchResults> Search(List<string> searchTerms, int page = 1, int pageSize = 10);
    Task<CreateBookRequest> GetBookDetails(string isbn);
}