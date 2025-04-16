using ILogger = Serilog.ILogger;
using Pluteo.Domain.Interfaces.Services;
using Pluteo.Domain.Models.Settings;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Static;
using Pluteo.Domain.Exceptions;
using System.Text.RegularExpressions;
using Pluteo.Domain.Models.Dto.Users;
using Pluteo.Domain.Models.Dto.Books;

namespace Pluteo.Application.Services;
public class BookService(ApplicationSettings config, ILogger logger, IBaseRepository<Book, Guid> bookRepository) : IBookService
{
    private readonly ApplicationSettings _config = config;
    private readonly ILogger _logger = logger;
    private readonly IBaseRepository<Book, Guid> _bookRepository = bookRepository;

    public async Task<Book> Create(CreateBookRequest request)
    {
        Book newBook = new()
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            ISBN = request.ISBN,
            Cover = request.Cover,
            Authors = request.Authors,
            Tags = request.Tags,
            Publishers = request.Publishers,
            PublishDate = request.PublishDate,
            NumPages = request.NumPages,
            HasEbook = request.HasEbook
        };

        await _bookRepository.Create(newBook);

        _logger.Information("New book {Title} ({Id}) has been registered.", newBook.Title, newBook.Id);

        return newBook;
    }

    public async Task Update(Book book)
    {
        await _bookRepository.Update(book);

        _logger.Information("Book {Title} ({Id}) has been updated.", book.Title, book.Id);
    }

    public async Task UpdateFromRequest(Guid bookId, UpdateBookRequest updateBookRequest)
    {
        if(updateBookRequest == null)
            throw new ServiceException("BOOK_UPDATE_REQUEST_NULL");

        Book book = await GetById(bookId) ?? throw new ServiceException("BOOK_NOT_EXISTS");
        bool isUpdated = false;
        if(!string.IsNullOrWhiteSpace(updateBookRequest.Title))
        {
            book.Title = updateBookRequest.Title;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(updateBookRequest.ISBN))
        {
            book.ISBN = updateBookRequest.ISBN;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(updateBookRequest.Cover))
        {
            book.Cover = updateBookRequest.Cover;
            isUpdated = true;
        }

        if(updateBookRequest.Authors != null && updateBookRequest.Authors.Count > 0)
        {
            book.Authors = updateBookRequest.Authors;
            isUpdated = true;
        }

        if(updateBookRequest.Tags != null && updateBookRequest.Tags.Count > 0)
        {
            book.Tags = updateBookRequest.Tags;
            isUpdated = true;
        }

        if(updateBookRequest.Publishers != null && updateBookRequest.Publishers.Count > 0)
        {
            book.Publishers = updateBookRequest.Publishers;
            isUpdated = true;
        }

        if(updateBookRequest.PublishDate != null)
        {
            book.PublishDate = updateBookRequest.PublishDate.Value;
            isUpdated = true;
        }

        if(updateBookRequest.NumPages != null)
        {
            book.NumPages = updateBookRequest.NumPages.Value;
            isUpdated = true;
        }

        if(updateBookRequest.HasEbook != null)
        {
            book.HasEbook = updateBookRequest.HasEbook.Value;
            isUpdated = true;
        }

        if(isUpdated)
            await Update(book);
        else
            _logger.Information("Book {Title} ({Id}) has no changes to update.", book.Title, book.Id);
    }

    public async Task Delete(Guid bookId)
    {
        await _bookRepository.Delete(bookId);

        _logger.Information("Book with ID ({Id}) has been deleted from database", bookId);
    }

    public async Task<Book> GetById(Guid bookId)
    {
        return await _bookRepository.GetById(bookId);
    }

    public async Task<List<Book>> List()
    {
        return await _bookRepository.List();
    }

    public async Task<List<Book>> Search(List<string> searchTerms, int page = 1, int pageSize = 10)
    {
        if(searchTerms == null || searchTerms.Count == 0)
            return await List();

        List<Book> books = await _bookRepository.List();
        List<Book> filteredBooks = [];

        foreach(string term in searchTerms)
        {
            Regex regex = new(term, RegexOptions.IgnoreCase);
            filteredBooks.AddRange(books.Where(book => regex.IsMatch(book.Title) || regex.IsMatch(book.ISBN) || regex.IsMatch(book.Tags.FirstOrDefault() ?? string.Empty)));
        }

        return [.. filteredBooks.Distinct().ToList().Skip((page - 1) * pageSize).Take(pageSize)];
    }
}
