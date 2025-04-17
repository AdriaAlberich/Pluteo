using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Dto.Books;
using Pluteo.Domain.Models.Dto.Library;
using Pluteo.Domain.Models.Dto.ShelfBooks;
using Pluteo.Domain.Models.Dto.Shelves;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Application.Systems;
public class LibrarySystem(ApplicationSettings config, UserService userService, BookService bookService, ILibraryIntegration externalLibrary, ILogger logger) : ILibrarySystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly BookService _bookService = bookService;
    private readonly ILogger _logger = logger;
    private readonly ILibraryIntegration _externalLibrary = externalLibrary;

    public async Task AddBook(string email, string isbn, Guid? shelfId)
    {
        throw new NotImplementedException();
    }

    public async Task AddBookManually(string email, CreateUpdateShelfBook book, Guid? shelfId)
    {

    }

    public async Task<LibraryOverview> GetLibrary(string email, string searchTerm, int page, int pageSize)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        List<string> searchTerms = string.IsNullOrEmpty(searchTerm)
            ? [string.Empty]
            : [.. searchTerm.Split(' ')];

        var shelves = user.Shelves;

        var shelfOverviews = shelves.Select(shelf =>
        {
            var filteredBooks = shelf.Books
                .Where(book => searchTerms.Any(term => book.Title.Contains(term, StringComparison.OrdinalIgnoreCase)))
                .Select(book => new ShelfBookOverview
                {
                    Id = book.Id,
                    Title = book.Title,
                    Cover = book.CoverSmall
                })
                .ToList();

            return new ShelfOverview
            {
                Id = shelf.Id,
                Name = shelf.Name,
                Books = filteredBooks
            };
        }).ToList();

        var paginatedShelves = shelfOverviews
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new LibraryOverview
        {
            Shelves = paginatedShelves
        };
    }

    public async Task<BookSearchResults> SearchNewBooks(bool external, string searchTerm, int page, int pageSize)
    {
        List<string> searchTerms = [];
        if (string.IsNullOrEmpty(searchTerm))
        {
            searchTerms.Add(string.Empty);
        }
        else
        {
            searchTerms = [.. searchTerm.Split(' ')];
        }

        if (external)
        {
            return await _externalLibrary.Search(searchTerms, page, pageSize);
        }
        else
        {
            return await _bookService.Search(searchTerms, page, pageSize);
        }
    }
}
