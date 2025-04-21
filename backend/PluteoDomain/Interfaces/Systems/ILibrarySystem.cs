using Pluteo.Domain.Models.Dto.Books;
using Pluteo.Domain.Models.Dto.Library;
using Pluteo.Domain.Models.Dto.ShelfBooks;

namespace Pluteo.Domain.Interfaces.Systems;
public interface ILibrarySystem
{
    Task<LibraryOverview> GetLibrary(string email, string searchTerm, int page, int pageSize);
    Task<BookSearchResults> SearchNewBooks(string searchTerm, int page, int pageSize, bool external = false);
    Task AddBook(string email, string isbn, Guid? shelfId);
    Task AddBookManually(string email, CreateUpdateShelfBook book, Guid? shelfId);
}
