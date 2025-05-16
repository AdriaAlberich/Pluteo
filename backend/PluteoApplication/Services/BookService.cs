using ILogger = Serilog.ILogger;
using Pluteo.Domain.Interfaces.Services;
using Pluteo.Domain.Models.Settings;
using Pluteo.Domain.Interfaces.Repositories;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Exceptions;
using System.Text.RegularExpressions;
using Pluteo.Domain.Models.Dto.Books;

namespace Pluteo.Application.Services;
public class BookService(ApplicationSettings config, ILogger logger, IBaseRepository<Book, Guid> bookRepository) : IBookService
{
    private readonly ApplicationSettings _config = config;
    private readonly ILogger _logger = logger;
    private readonly IBaseRepository<Book, Guid> _bookRepository = bookRepository;

    /// <summary>
    /// Creates a new book in the database.
    /// </summary>
    /// <param name="request">CreateBookRequest</param>
    /// <returns>Book</returns>
    public async Task<Book> Create(CreateBookRequest request)
    {
        Book newBook = new()
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            ISBN = request.ISBN,
            CoverBig = request.CoverBig,
            CoverSmall = request.CoverSmall,
            Authors = request.Authors,
            Publishers = request.Publishers,
            PublishPlaces = request.PublishPlaces,
            FirstPublishYear = request.FirstPublishYear,
            NumPages = request.NumPages,
            AvailableLanguages = request.AvailableLanguages
        };

        await _bookRepository.Create(newBook);

        _logger.Information("New book {Title} ({Id}) has been registered.", newBook.Title, newBook.Id);

        return newBook;
    }

    /// <summary>
    /// Updates an existing book in the database.
    /// </summary>
    /// <param name="book">Book</param>
    /// <returns></returns>
    public async Task Update(Book book)
    {
        await _bookRepository.Update(book);

        _logger.Information("Book {Title} ({Id}) has been updated.", book.Title, book.Id);
    }

    /// <summary>
    /// Updates an existing book in the database from a request.
    /// </summary>
    /// <param name="bookId">Guid of the book</param>
    /// <param name="updateBookRequest"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task UpdateFromRequest(Guid bookId, UpdateBookRequest updateBookRequest)
    {
        if(updateBookRequest == null)
            throw new ServiceException("BOOK_UPDATE_REQUEST_NULL");

        Book book = await GetById(bookId) ?? throw new ServiceException("BOOK_NOT_EXISTS");

        // Update only if at least one field is changed
        bool isUpdated = false;

        if(!string.IsNullOrWhiteSpace(updateBookRequest.Title))
        {
            book.Title = updateBookRequest.Title;
            isUpdated = true;
        }

        if(updateBookRequest.ISBN != null && updateBookRequest.ISBN.Count > 0)
        {
            book.ISBN = updateBookRequest.ISBN;
            isUpdated = true;
        }

        if(updateBookRequest.Authors != null && updateBookRequest.Authors.Count > 0)
        {
            book.Authors = updateBookRequest.Authors;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(updateBookRequest.CoverBig))
        {
            book.CoverBig = updateBookRequest.CoverBig;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(updateBookRequest.CoverSmall))
        {
            book.CoverSmall = updateBookRequest.CoverSmall;
            isUpdated = true;
        }

        if(updateBookRequest.Publishers != null && updateBookRequest.Publishers.Count > 0)
        {
            book.Publishers = updateBookRequest.Publishers;
            isUpdated = true;
        }

        if(updateBookRequest.PublishPlaces != null && updateBookRequest.PublishPlaces.Count > 0)
        {
            book.PublishPlaces = updateBookRequest.PublishPlaces;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(updateBookRequest.FirstPublishYear))
        {
            book.FirstPublishYear = updateBookRequest.FirstPublishYear;
            isUpdated = true;
        }

        if(updateBookRequest.NumPages > 0)
        {
            book.NumPages = updateBookRequest.NumPages;
            isUpdated = true;
        }

        if(updateBookRequest.AvailableLanguages != null && updateBookRequest.AvailableLanguages.Count > 0)
        {
            book.AvailableLanguages = updateBookRequest.AvailableLanguages;
            isUpdated = true;
        }

        if(isUpdated)
            await Update(book);
        else
            _logger.Information("Book {Title} ({Id}) has no changes to update.", book.Title, book.Id);
    }

    /// <summary>
    /// Deletes a book from the database.
    /// </summary>
    /// <param name="bookId"></param>
    /// <returns></returns>
    public async Task Delete(Guid bookId)
    {
        await _bookRepository.Delete(bookId);

        _logger.Information("Book with ID ({Id}) has been deleted from database", bookId);
    }

    /// <summary>
    /// Gets a book by its ID.
    /// </summary>
    /// <param name="bookId"></param>
    /// <returns></returns>
    public async Task<Book> GetById(Guid bookId)
    {
        return await _bookRepository.GetById(bookId);
    }

    /// <summary>
    /// Gets a book by its ISBN.
    /// </summary>
    /// <param name="isbn"></param>
    /// <returns></returns>
    public async Task<Book?> GetByISBN(string isbn)
    {
        var books = await _bookRepository.List();
        return books.FirstOrDefault(b => b.ISBN.Contains(isbn));
    }

    /// <summary>
    /// Lists all books in the database.
    /// </summary>
    /// <returns></returns>
    public async Task<List<Book>> List()
    {
        return await _bookRepository.List();
    }

    /// <summary>
    /// Searches for books in the database by their title.
    /// </summary>
    /// <param name="searchTerms"></param>
    /// <param name="page"></param>
    /// <param name="pageSize"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task<BookSearchResults> Search(List<string> searchTerms, int page = 1, int pageSize = 10)
    {
        if(searchTerms == null || searchTerms.Count == 0)
            throw new ServiceException("SEARCH_TERMS_NULL_OR_EMPTY");

        List<Book> books = await _bookRepository.List();
        List<Book> filteredBooks = [];


        // Filter bookks with the search terms
        foreach(string term in searchTerms)
        {
            var regex = new Regex(term, RegexOptions.IgnoreCase);
            var matchingBooks = books.Where(book => regex.IsMatch(book.Title)).ToList();
            filteredBooks.AddRange(matchingBooks);
        }

        // Remove duplicates
        filteredBooks = [.. filteredBooks.Distinct()];

        // Paginate the results
        int totalCount = filteredBooks.Count;
        int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        int skip = (page - 1) * pageSize;
        List<Book> paginatedBooks = [.. filteredBooks.Skip(skip).Take(pageSize)];

        // Create the response object
        BookSearchResults results = new()
        {
            TotalResults = totalCount,
            TotalPages = totalPages,
            Page = page,
            Results = [.. paginatedBooks
                .Select(book => new BookSearchResult
                {
                    Title = book.Title,
                    ISBN = book.ISBN,
                    SearchCoverUrl = book.CoverSmall,
                    Authors = book.Authors,
                    Publishers = book.Publishers,
                    PublishPlaces = book.PublishPlaces,
                    FirstPublishYear = book.FirstPublishYear,
                    NumPages = book.NumPages,
                    AvailableLanguages = book.AvailableLanguages
                })]
        };

        _logger.Information("Search for books with terms {SearchTerms} returned {TotalResults} results.", string.Join(" ", searchTerms), totalCount);
        
        return results;
    }
}
