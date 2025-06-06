using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Dto.ShelfBooks;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;
using Pluteo.Domain.Enums;

namespace Pluteo.Application.Systems;
public class ShelfBookSystem(ApplicationSettings config, UserService userService, NotificationSystem notificationSystem, IResourceManager localizationManager, ILogger logger) : IShelfBookSystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly NotificationSystem _notificationSystem = notificationSystem;
    private readonly IResourceManager _localizationManager = localizationManager;
    private readonly ILogger _logger = logger;

    /// <summary>
    /// Adds a new shelf book to the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBook"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task AddShelfBook(string email, Guid shelfId, ShelfBook shelfBook)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBook == null || shelfBook.Id == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");
        
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        shelf.Books.Add(shelfBook);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been added to shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Gets a shelf book from the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task<ShelfBook> GetShelfBook(string email, Guid shelfId, Guid shelfBookId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        return shelfBook;
    }

    /// <summary>
    /// Gets the details of a shelf book from the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <returns></returns>
    public async Task<ShelfBookDetails> GetShelfBookDetails(string email, Guid shelfId, Guid shelfBookId)
    {
        var shelfBook = await GetShelfBook(email, shelfId, shelfBookId);
        
        var shelfBookDetails = new ShelfBookDetails
        {
            Id = shelfBook.Id,
            Order = shelfBook.Order,
            Title = shelfBook.Title,
            ISBN = string.Join(" ", shelfBook.ISBN),
            Authors = string.Join(" ", shelfBook.Authors),
            Cover = shelfBook.CoverSmall,
            FirstPublishYear = shelfBook.FirstPublishYear,
            Publisher = string.Join(" ", shelfBook.Publisher),
            PublishPlace = string.Join(" ", shelfBook.PublishPlace),
            NumPages = shelfBook.NumPages,
            AvailableLanguages = string.Join(" ", shelfBook.AvailableLanguages),
            PhysicalLocation = shelfBook.PhysicalLocation,
            Notes = shelfBook.Notes,
            Status = ((int)shelfBook.Status).ToString(),
            Loan = shelfBook.Loan,
        };

        return shelfBookDetails;
    }

    /// <summary>
    /// Moves a shelf book from one shelf to another.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <param name="newShelfId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task MoveShelfBook(string email, Guid shelfId, Guid shelfBookId, Guid newShelfId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(newShelfId == Guid.Empty)
            throw new ServiceException("NEW_SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var newShelf = user.Shelves.FirstOrDefault(s => s.Id == newShelfId) ?? throw new ServiceException("NEW_SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        shelfBook.Order = newShelf.Books.Count + 1;
        shelf.Books.Remove(shelfBook);
        newShelf.Books.Add(shelfBook);

        await _userService.Update(user);

        _logger.Information("Shelf book {Name} ({Id}) has been moved from shelf {ShelfName} ({ShelfId}) to shelf {NewShelfName} ({NewShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, newShelf.Name, newShelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Removes a shelf book from the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task RemoveShelfBook(string email, Guid shelfId, Guid shelfBookId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        shelf.Books.Remove(shelfBook);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been removed from shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Reorders a shelf book in the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <param name="newOrder"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task ReOrderShelfBook(string email, Guid shelfId, Guid shelfBookId, int newOrder)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        if(newOrder < 1)
            throw new ServiceException("INVALID_SHELF_BOOK_ORDER");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        if(newOrder > shelf.Books.Count)
            throw new ServiceException("INVALID_SHELF_BOOK_ORDER");

        shelf.Books.Remove(shelfBook);

        shelf.Books.Insert(newOrder - 1, shelfBook);

        for(int i = 0; i < shelf.Books.Count; i++)
        {
            shelf.Books[i].Order = i + 1;
        }

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has been reordered to position {NewOrder} in shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, newOrder, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Updates a shelf book in the user's shelf.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <param name="request"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task UpdateShelfBook(string email, Guid shelfId, Guid shelfBookId, ShelfBookDetails request)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        if(request == null)
            throw new ServiceException("SHELF_BOOK_UPDATE_CANNOT_BE_NULL");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        bool isUpdated = false;

        if(request.Title != null)
        {
            shelfBook.Title = request.Title;
            isUpdated = true;
        }

        if(request.ISBN != null)
        {
            shelfBook.ISBN = [];
            shelfBook.ISBN.Add(request.ISBN);
            
            isUpdated = true;
        }

        if(request.Authors != null)
        {
            shelfBook.Authors = [];
            shelfBook.Authors.Add(request.Authors);
            
            isUpdated = true;
        }

        if(request.Cover != null)
        {
            shelfBook.CoverBig = request.Cover;
            shelfBook.CoverSmall = request.Cover;
            isUpdated = true;
        }

        if(request.FirstPublishYear != null)
        {
            shelfBook.FirstPublishYear = request.FirstPublishYear;
            isUpdated = true;
        }
        
        if(request.Publisher != null)
        {
            shelfBook.Publisher = [];
            shelfBook.Publisher.Add(request.Publisher);
            
            isUpdated = true;
        }

        if(request.PublishPlace != null)
        {
            shelfBook.PublishPlace = [];
            shelfBook.PublishPlace.Add(request.PublishPlace);
            
            isUpdated = true;
        }

        if(request.NumPages.HasValue)
        {
            shelfBook.NumPages = request.NumPages.Value;
            isUpdated = true;
        }

        if(request.AvailableLanguages != null)
        {
            shelfBook.AvailableLanguages = [];
            shelfBook.AvailableLanguages.Add(request.AvailableLanguages);
            
            isUpdated = true;
        }

        if(request.PhysicalLocation != null)
        {
            shelfBook.PhysicalLocation = request.PhysicalLocation;
            isUpdated = true;
        }
        
        if(request.Notes != null)
        {
            shelfBook.Notes = request.Notes;
            isUpdated = true;
        }

        if(request.Status != null)
        {
            if(Enum.TryParse<ShelfBookStatus>(request.Status, true, out var status))
            {
                shelfBook.Status = status;
                isUpdated = true;
            }
        }

        if(isUpdated)
        {
            await _userService.Update(user);
            _logger.Information("Shelf book {Name} ({Id}) has been updated in shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
        }
        else
            _logger.Information("No changes were made to shelf book {Name} ({Id}) in shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Activates the loan notifications for a shelf book.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <param name="request"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task ActivateShelfBookLoan(string email, Guid shelfId, Guid shelfBookId, ActivateShelfBookLoanRequest request)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        if(request == null || string.IsNullOrWhiteSpace(request.Library) || request.DueDate == default)
            throw new ServiceException("SHELF_BOOK_LOAN_CANNOT_BE_NULL");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        if(shelfBook.Loan != null)
            throw new ServiceException("SHELF_BOOK_LOAN_ALREADY_EXISTS");

        // Add the loan info
        shelfBook.Loan = new LibraryLoan
        {
            Library = request.Library,
            LoanDate = DateTime.UtcNow,
            DueDate = request.DueDate.ToUniversalTime(),
            Notify = request.Notify,
            LastNotificationDate = DateTime.UtcNow,
        };

        // Send a notification if the user has enabled it
        if(user.Settings.NotifyLoan)
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanInitialNotificationMessage", shelfBook.Title);
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);
        }

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has loan notifications activated for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Deactivates the loan notifications for a shelf book.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task DeactivateShelfBookLoan(string email, Guid shelfId, Guid shelfBookId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        if(shelfBook.Loan == null)
            throw new ServiceException("SHELF_BOOK_LOAN_NOT_EXISTS");

        shelfBook.Loan = null;

        // Send a notification if the user has enabled it
        if(user.Settings.NotifyLoan)
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanDeactivationNotificationMessage", shelfBook.Title);
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);
        }

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has loan notifications deactivated for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Checks if the loan is active for a shelf book.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="shelfBookId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task<bool> IsShelfBookLoanActive(string email, Guid shelfId, Guid shelfBookId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        if(shelfBookId == Guid.Empty)
            throw new ServiceException("SHELF_BOOK_CANNOT_BE_NULL_OR_EMPTY");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");
        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        return shelfBook.Loan != null;
    }

    /// <summary>
    /// Sends loan notifications to users.
    /// </summary>
    /// <returns></returns>
    public async Task SendLoanNotifications()
    {
        var users = await _userService.ListWithLoans();

        foreach(var user in users)
        {
            if(user.Settings.NotifyLoan == false)
                continue;

            foreach(var shelf in user.Shelves)
            {
                foreach(var shelfBook in shelf.Books)
                {
                    if(shelfBook.Loan != null && shelfBook.Loan.Notify)
                    {
                        await SendLoanNotification(user, shelfBook);
                    }
                }
            }
        }
    }

    /// <summary>
    /// Sends a loan notification to a user.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="shelfBook"></param>
    /// <returns></returns>
    public async Task SendLoanNotification(User user, ShelfBook shelfBook)
    {
        if(shelfBook.Loan == null)
            return;
            
        // Loan is active and overdue
        if(user.Settings.NotifyLoanBeforeDaysFrequency > 0 && 
           shelfBook.Loan.DueDate < DateTime.UtcNow && 
           shelfBook.Loan.LastNotificationDate <= DateTime.UtcNow.AddDays(-user.Settings.NotifyLoanBeforeDaysFrequency))
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanOverdueNotificationMessage", shelfBook.Title);
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);

            shelfBook.Loan.LastNotificationDate = DateTime.UtcNow;

            await _userService.Update(user);
        }
        
        // Loan is active and not overdue, notify before days
        else if(user.Settings.NotifyLoanBeforeDays > 0 && user.Settings.NotifyLoanBeforeDaysFrequency > 0 &&
                shelfBook.Loan.DueDate <= DateTime.UtcNow.AddDays(user.Settings.NotifyLoanBeforeDays) && 
                shelfBook.Loan.LastNotificationDate <= DateTime.UtcNow.AddDays(-user.Settings.NotifyLoanBeforeDaysFrequency))
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationMessage", shelfBook.Title, shelfBook.Loan.DueDate.ToString("dd/MM/yyyy"));
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);

            shelfBook.Loan.LastNotificationDate = DateTime.UtcNow;

            await _userService.Update(user);
        }
    }
}
