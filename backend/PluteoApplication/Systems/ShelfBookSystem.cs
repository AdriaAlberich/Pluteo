using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Dto.ShelfBooks;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Application.Systems;
public class ShelfBookSystem(ApplicationSettings config, UserService userService, NotificationSystem notificationSystem, IResourceManager localizationManager, ILogger logger) : IShelfBookSystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly NotificationSystem _notificationSystem = notificationSystem;
    private readonly IResourceManager _localizationManager = localizationManager;
    private readonly ILogger _logger = logger;

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

    public async Task<ShelfBook> GetShelfBook(string email, Guid shelfId, Guid shelfBookId)
    {
        if(shelfId == Guid.Empty)
            throw new ServiceException("SHELF_CANNOT_BE_NULL");

        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        var shelfBook = shelf.Books.FirstOrDefault(sb => sb.Id == shelfBookId) ?? throw new ServiceException("SHELF_BOOK_NOT_EXISTS");

        return shelfBook;
    }

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

        shelf.Books.Remove(shelfBook);
        newShelf.Books.Add(shelfBook);

        await _userService.Update(user);

        _logger.Information("Shelf book {Name} ({Id}) has been moved from shelf {ShelfName} ({ShelfId}) to shelf {NewShelfName} ({NewShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, newShelf.Name, newShelf.Id, user.Email, user.Id);
    }

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

    public async Task UpdateShelfBook(string email, Guid shelfId, Guid shelfBookId, CreateUpdateShelfBook request)
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

        if(!string.IsNullOrWhiteSpace(request.Title))
        {
            shelfBook.Title = request.Title;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.ISBN))
        {
            shelfBook.ISBN = [];
            shelfBook.ISBN.Add(request.ISBN);
            
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.Authors))
        {
            shelfBook.Authors = [];
            shelfBook.Authors.Add(request.Authors);
            
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.Cover))
        {
            shelfBook.CoverBig = request.Cover;
            shelfBook.CoverSmall = request.Cover;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.FirstPublishYear))
        {
            shelfBook.FirstPublishYear = request.FirstPublishYear;
            isUpdated = true;
        }
        
        if(!string.IsNullOrWhiteSpace(request.Publisher))
        {
            shelfBook.Publisher = [];
            shelfBook.Publisher.Add(request.Publisher);
            
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.PublishPlace))
        {
            shelfBook.PublishPlace = [];
            shelfBook.PublishPlace.Add(request.PublishPlace);
            
            isUpdated = true;
        }

        if(request.NumPages > 0)
        {
            shelfBook.NumPages = request.NumPages;
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.AvailableLanguages))
        {
            shelfBook.AvailableLanguages = [];
            shelfBook.AvailableLanguages.Add(request.AvailableLanguages);
            
            isUpdated = true;
        }

        if(!string.IsNullOrWhiteSpace(request.PhysicalLocation))
        {
            shelfBook.PhysicalLocation = request.PhysicalLocation;
            isUpdated = true;
        }
        
        if(!string.IsNullOrWhiteSpace(request.Notes))
        {
            shelfBook.Notes = request.Notes;
            isUpdated = true;
        }

        if(isUpdated)
        {
            await _userService.Update(user);
            _logger.Information("Shelf book {Name} ({Id}) has been updated in shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
        }
        else
            _logger.Information("No changes were made to shelf book {Name} ({Id}) in shelf {ShelfName} ({ShelfId}) for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

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

        shelfBook.Loan = new LibraryLoan
        {
            Library = request.Library,
            LoanDate = DateTime.UtcNow,
            DueDate = request.DueDate,
            Notify = true,
            LastNotificationDate = DateTime.UtcNow,
        };

        string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanInitialNotificationMessage", shelfBook.Title, user.Settings.NotifyLoanBeforeDays, user.Settings.NotifyLoanBeforeDaysFrequency);
        await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has loan notifications activated for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

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

        await _userService.Update(user);
        _logger.Information("Shelf book {Name} ({Id}) has loan notifications deactivated for user {Email} ({Id}).", shelfBook.Title, shelfBook.Id, shelf.Name, shelf.Id, user.Email, user.Id);
    }

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

    public async Task SendLoanNotifications()
    {
        // Change this to a more efficient way to get users with loans
        var users = await _userService.List();

        foreach(var user in users)
        {
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

    public async Task SendLoanNotification(User user, ShelfBook shelfBook)
    {
        if(shelfBook.Loan == null)
            return;
            
        // Loan is active and overdue
        if(shelfBook.Loan.DueDate > DateTime.UtcNow && shelfBook.Loan.LastNotificationDate <= DateTime.UtcNow.AddDays(-user.Settings.NotifyLoanBeforeDaysFrequency))
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanOverdueNotificationMessage", shelfBook.Title);
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);

            shelfBook.Loan.LastNotificationDate = DateTime.UtcNow;

            await _userService.Update(user);
        }
        // Loan is active and not overdue, notify before days
        else if(shelfBook.Loan.DueDate <= DateTime.UtcNow.AddDays(user.Settings.NotifyLoanBeforeDays) && shelfBook.Loan.LastNotificationDate <= DateTime.UtcNow.AddDays(-user.Settings.NotifyLoanBeforeDaysFrequency))
        {
            string message = _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationMessage", shelfBook.Title, shelfBook.Loan.DueDate.ToString("dd/MM/yyyy"));
            await _notificationSystem.AddNotification(user, _localizationManager.GetStringFormatted(user.Settings.Locale, "LoanNotificationTitle", shelfBook.Title), message);

            shelfBook.Loan.LastNotificationDate = DateTime.UtcNow;

            await _userService.Update(user);
        }
    }
}
