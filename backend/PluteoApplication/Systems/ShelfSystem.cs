using System.Runtime.CompilerServices;
using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces;
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

    public async Task AddUserShelf(string email, string name)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        if(user.Shelves.Any(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
            throw new ServiceException("SHELF_ALREADY_EXISTS");

        await AddShelf(user, name, false, false);
    }

    public async Task RemoveUserShelf(string email, Guid shelfId)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        if(shelf.Books.Count > 0)
            throw new ServiceException("SHELF_NOT_EMPTY");

        user.Shelves.Remove(shelf);

        await _userService.Update(user);
        _logger.Information("Shelf {Name} ({Id}) has been removed for user {Email} ({Id}).", shelf.Name, shelf.Id, user.Email, user.Id);
    }

    public async Task ReOrderUserShelf(string email, Guid shelfId, int newOrder)
    {
        var user = await _userService.GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");

        var shelf = user.Shelves.FirstOrDefault(s => s.Id == shelfId) ?? throw new ServiceException("SHELF_NOT_EXISTS");

        if(newOrder < 1 || newOrder > user.Shelves.Count)
            throw new ServiceException("INVALID_SHELF_ORDER");

        shelf.Order = newOrder;

        await _userService.Update(user);
    }

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
