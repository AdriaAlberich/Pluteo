using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Application.Systems;
public class ShelfSystem(ApplicationSettings config, UserService userService, ILogger logger) : IShelfSystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly ILogger _logger = logger;

    /// <summary>
    /// Adds a new shelf to the user.
    /// </summary>
    /// <param name="user"></param>
    /// <param name="name"></param>
    /// <param name="isDefault"></param>
    /// <param name="IsReadQueue"></param>
    /// <returns></returns>
    public async Task AddShelf(User user, string name, bool isDefault = false, bool IsReadQueue = false)
    {
        var shelf = new Shelf
        {
            Id = Guid.NewGuid(),
            Name = name,
            IsDefault = isDefault,
            IsReadQueue = IsReadQueue,
            Books = [],
            Order = user.Shelves.Count + 1
        };

        user.Shelves.Add(shelf);

        await _userService.Update(user);
        _logger.Information("New shelf {Name} ({Id}) has been registered for user {Email} ({Id}).", name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Adds a new shelf to the user.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="name"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task AddUserShelf(string email, string name)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        if(user.Shelves.Any(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
            throw new ServiceException("SHELF_ALREADY_EXISTS");

        await AddShelf(user, name, false, false);
    }

    /// <summary>
    /// Removes a shelf from the user.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task RemoveUserShelf(string email, Guid shelfId)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        if(shelf.Books.Count > 0)
            throw new ServiceException("SHELF_NOT_EMPTY");

        user.Shelves.Remove(shelf);

        for(int i = 0; i < user.Shelves.Count; i++)
        {
            if(user.Shelves[i].Order > shelf.Order)
                user.Shelves[i].Order--;
        }

        await _userService.Update(user);
        _logger.Information("Shelf {Name} ({Id}) has been removed for user {Email} ({Id}).", shelf.Name, shelf.Id, user.Email, user.Id);
    }

    /// <summary>
    /// Reorders a shelf for the user (move up or down)
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="newOrder"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task ReOrderUserShelf(string email, Guid shelfId, int newOrder)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        if(newOrder == 1)
        {
            if(shelf.Order == 1)
                throw new ServiceException("SHELF_ALREADY_FIRST");

            var previousShelf = user.Shelves.FirstOrDefault(s => s.Order == shelf.Order - 1) ?? throw new ServiceException("SHELF_NOT_EXISTS");

            if(previousShelf.IsDefault || previousShelf.IsReadQueue)
                throw new ServiceException("SHELF_CANNOT_BE_FIRST");

            shelf.Order--;
            previousShelf.Order++;
        }
        else if(newOrder == 2)
        {
            if(shelf.Order == user.Shelves.Count)
                throw new ServiceException("SHELF_ALREADY_LAST");

            var nextShelf = user.Shelves.FirstOrDefault(s => s.Order == shelf.Order + 1) ?? throw new ServiceException("SHELF_NOT_EXISTS");

            shelf.Order++;
            nextShelf.Order--;
        }
        else
        {
            throw new ServiceException("INVALID_ORDER");
        }

        _logger.Information("Shelf {Name} ({Id}) has been reordered for user {Email} ({Id}).", shelf.Name, shelf.Id, user.Email, user.Id);

        await _userService.Update(user);
    }

    /// <summary>
    /// Updates a shelf for the user.
    /// </summary>
    /// <param name="email"></param>
    /// <param name="shelfId"></param>
    /// <param name="newName"></param>
    /// <returns></returns>
    /// <exception cref="ServiceException"></exception>
    public async Task UpdateUserShelf(string email, Guid shelfId, string newName)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        if(user.Shelves.Any(s => s.Name.Equals(newName, StringComparison.OrdinalIgnoreCase) && s.Id != shelfId))
            throw new ServiceException("SHELF_ALREADY_EXISTS");

        shelf.Name = newName;

        await _userService.Update(user);
        _logger.Information("Shelf {Name} ({Id}) has been updated for user {Email} ({Id}).", newName, shelf.Id, user.Email, user.Id);
    }
}
