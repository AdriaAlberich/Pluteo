using Pluteo.Domain.Models.Dto.Books;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Services;
public interface IBookService : IBaseEntityService<Book, Guid>
{
        Task<Book> Create(CreateBookRequest request);
        Task UpdateFromRequest(Guid id, UpdateBookRequest request);
        Task<Book> GetByISBN(string isbn);
        Task<BookSearchResults> Search(List<string> searchTerms, int page, int pageSize);
}
