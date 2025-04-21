using Pluteo.Application.Services;
using Pluteo.Domain.Enums;
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
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var book = await _bookService.GetByISBN(isbn) ?? throw new ServiceException("BOOK_NOT_FOUND");

        if (user.Shelves.All(s => s.Books.All(b => b.ISBN != book.ISBN)))
        {
            throw new ServiceException("BOOK_ALREADY_EXISTS_IN_SHELF");
        }

        ShelfBook? shelfBook = null;
        if (book != null)
        {
            shelfBook = new ShelfBook
            {
                Id = Guid.NewGuid(),
                Title = book.Title,
                ISBN = book.ISBN,
                Authors = book.Authors,
                CoverSmall = book.CoverSmall,
                CoverBig = book.CoverBig,
                Publisher = book.Publishers,
                PublishPlace = book.PublishPlaces,
                FirstPublishYear = book.FirstPublishYear,
                AvailableLanguages = book.AvailableLanguages,
                NumPages = book.NumPages,
                PhysicalLocation = string.Empty,
                Notes = string.Empty,
                Status = ShelfBookStatus.None,
                Order = 0
            };
        }
        else
        {
            var externalBook = await _externalLibrary.GetBookDetails(isbn) ?? throw new ServiceException("BOOK_NOT_FOUND");
            
            shelfBook = new ShelfBook
            {
                Id = Guid.NewGuid(),
                Title = externalBook.Title,
                ISBN = externalBook.ISBN,
                Authors = externalBook.Authors,
                CoverSmall = externalBook.CoverSmall,
                CoverBig = externalBook.CoverBig,
                Publisher = externalBook.Publishers,
                PublishPlace = externalBook.PublishPlaces,
                FirstPublishYear = externalBook.FirstPublishYear,
                AvailableLanguages = externalBook.AvailableLanguages,
                NumPages = externalBook.NumPages,
                PhysicalLocation = string.Empty,
                Notes = string.Empty,
                Status = ShelfBookStatus.None,
                Order = 0
            };

            await _bookService.Create(new CreateBookRequest
            {
                Title = externalBook.Title,
                ISBN = externalBook.ISBN,
                CoverBig = externalBook.CoverBig,
                CoverSmall = externalBook.CoverSmall,
                Authors = externalBook.Authors,
                Publishers = externalBook.Publishers,
                PublishPlaces = externalBook.PublishPlaces,
                FirstPublishYear = externalBook.FirstPublishYear,
                NumPages = externalBook.NumPages,
                AvailableLanguages = externalBook.AvailableLanguages
            });
        }

        Shelf? shelf = null;
        if(shelfId == null || shelfId == Guid.Empty)
        {
            shelf = user.Shelves.FirstOrDefault(s => s.IsDefault) ?? throw new ServiceException("DEFAULT_SHELF_NOT_FOUND");
        }
        else
        {
            shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        }

        shelfBook.Order = shelf.Books.Count + 1;

        shelf.Books.Add(shelfBook);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been added to shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    public async Task AddBookManually(string email, CreateUpdateShelfBook book, Guid? shelfId)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelfBook = new ShelfBook
        {
            Id = Guid.NewGuid(),
            Title = book.Title ?? string.Empty,
            ISBN = [book.ISBN ?? string.Empty],
            Authors = [book.Authors ?? string.Empty],
            CoverSmall = book.Cover,
            CoverBig = book.Cover,
            Publisher = [book.Publisher ?? string.Empty],
            PublishPlace = [book.PublishPlace ?? string.Empty],
            FirstPublishYear = book.FirstPublishYear ?? string.Empty,
            AvailableLanguages = [book.AvailableLanguages ?? string.Empty],
            NumPages = book.NumPages ?? 0,
            PhysicalLocation = book.PhysicalLocation ?? string.Empty,
            Notes = book.Notes ?? string.Empty,
            Status = book.Status ?? ShelfBookStatus.None,
            Order = 0
        };

        Shelf? shelf = null;
        if(shelfId == null || shelfId == Guid.Empty)
        {
            shelf = user.Shelves.FirstOrDefault(s => s.IsDefault) ?? throw new ServiceException("DEFAULT_SHELF_NOT_FOUND");
        }
        else
        {
            shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        }

        shelfBook.Order = shelf.Books.Count + 1;

        shelf.Books.Add(shelfBook);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been added to shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", book.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
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
