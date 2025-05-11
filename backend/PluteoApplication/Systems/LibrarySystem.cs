using Pluteo.Application.Services;
using Pluteo.Domain.Enums;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Integrations;
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

    /// <summary>
    /// Adds an existing book to the user's library.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="isbn"></param>
    /// <param name="shelfId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task AddBook(string email, string isbn, Guid? shelfId)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");


        // Check if the book already exists in the database
        Book? book = await _bookService.GetByISBN(isbn);

        ShelfBook? shelfBook = null;

        // If exists, check if it is alredy in the user's library and if not create a new one as a shelf book
        if (book != null)
        {
            // Check if the book already exists in the user's library
            if (!user.Shelves.All(s => s.Books.All(b => b.ISBN.FirstOrDefault() != book.ISBN.FirstOrDefault())))
                throw new ServiceException("BOOK_ALREADY_EXISTS_IN_SHELF");

            shelfBook = new ShelfBook
            {
                Id = Guid.NewGuid(),
                Title = book.Title,
                ISBN = book.ISBN,
                Authors = book.Authors,
                Book = book.Id,
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
            // If not, get the book details from the external source
            var externalBook = await _externalLibrary.GetBookDetails(isbn) ?? throw new ServiceException("BOOK_NOT_FOUND");

            // Create a new book in the database
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

            // Get the book from the database
            var newBookId = await _bookService.GetByISBN(isbn) ?? throw new ServiceException("BOOK_NOT_FOUND");

            // Create a new shelf book
            shelfBook = new ShelfBook
            {
                Id = Guid.NewGuid(),
                Title = externalBook.Title,
                ISBN = externalBook.ISBN,
                Authors = externalBook.Authors,
                Book = newBookId.Id,
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
        }

        // Add the shelf book to the user's library
        Shelf? shelf = null;
        if(shelfId == null || shelfId == Guid.Empty)
        {
            shelf = user.Shelves.FirstOrDefault(s => s.IsDefault) ?? throw new ServiceException("DEFAULT_SHELF_NOT_FOUND");
        }
        else
        {
            shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        }

        // Put the new book to the end of the shelf
        shelfBook.Order = shelf.Books.Count + 1;

        // Add the book to the shelf
        shelf.Books.Add(shelfBook);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been added to shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Adds a book to the user's library manually (custom one).
    /// </summary>
    /// <param name="email"></param>
    /// <param name="book"></param>
    /// <param name="shelfId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task AddBookManually(string email, CreateUpdateShelfBook book, Guid? shelfId)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelfBook = new ShelfBook
        {
            Id = Guid.NewGuid(),
            Title = book.Title ?? string.Empty,
            ISBN = [book.ISBN ?? string.Empty],
            Authors = [book.Authors ?? string.Empty],
            CoverSmall = book.Cover ?? string.Empty,
            CoverBig = book.Cover ?? string.Empty,
            Publisher = [book.Publisher ?? string.Empty],
            PublishPlace = [book.PublishPlace ?? string.Empty],
            FirstPublishYear = book.FirstPublishYear ?? string.Empty,
            AvailableLanguages = [book.AvailableLanguages ?? string.Empty],
            NumPages = book.NumPages ?? 0,
            PhysicalLocation = book.PhysicalLocation ?? string.Empty,
            Notes = book.Notes ?? string.Empty,
            Status = Enum.Parse<ShelfBookStatus>(book.Status ?? string.Empty, true),
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

    /// <summary>
    /// Gets the user's library overview.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="filterTerm"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task<LibraryOverview> GetLibrary(string email, string? filterTerm)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        // Normalize the filter
        if(filterTerm == null || filterTerm == "all")
        {
            filterTerm = string.Empty;
        }
        else
        {
            filterTerm = Uri.UnescapeDataString(filterTerm);
        }

        List<string> filterTerms = string.IsNullOrWhiteSpace(filterTerm)
            ? []
            : [.. filterTerm.Split('+')];

        // Get the user's shelves with the filter applied, we also map the shelf books to a simple overview object
        var shelves = user.Shelves;
        var shelfOverviews = shelves.Select(shelf =>
        {
            var filteredBooks = shelf.Books
                .Where(book => filterTerms.Count == 0 || filterTerms.Any(term => book.Title.Contains(term, StringComparison.OrdinalIgnoreCase)))
                .Select(book => new ShelfBookOverview
                {
                    Id = book.Id,
                    Title = book.Title,
                    Order = book.Order,
                    Cover = book.CoverSmall
                })
                .ToList();

            return new ShelfOverview
            {
                Id = shelf.Id,
                Name = shelf.Name,
                Order = shelf.Order,
                IsDefault = shelf.IsDefault,
                IsReadQueue = shelf.IsReadQueue,
                Books = filteredBooks
            };
        }).ToList();

        return new LibraryOverview
        {
            Shelves = shelfOverviews
        };
    }

    /// <summary>
    /// Searches for new books in the library (internal and external).
    /// </summary>
    /// <param name="searchTerm"></param>
    /// <param name="page"></param>
    /// <param name="pageSize"></param>
    /// <param name="external"></param>
    /// <returns></returns>
    public async Task<BookSearchResults> SearchNewBooks(string searchTerm, int page, int pageSize, bool external = false)
    {
        List<string> searchTerms = [];

        // Normalize the search term
        if (string.IsNullOrEmpty(searchTerm))
        {
            searchTerms.Add(string.Empty);
        }
        else
        {
            searchTerm = Uri.UnescapeDataString(searchTerm);
            searchTerms = [.. searchTerm.Split('+')];
        }

        // Check if is external or internal search
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
