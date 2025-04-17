using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Interfaces.Systems;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Application.Systems;
public class ShelfBookSystem(ApplicationSettings config, UserService userService, ILogger logger) : IShelfBookSystem
{
    private readonly ApplicationSettings _config = config;
    private readonly UserService _userService = userService;
    private readonly ILogger _logger = logger;

    public Task AddShelfBook(string email, Guid shelfId, ShelfBook shelfBook)
    {
        throw new NotImplementedException();
    }

    public Task<ShelfBook> GetShelfBook(string email, Guid shelfId, Guid shelfBookId)
    {
        throw new NotImplementedException();
    }

    public Task MoveShelfBook(string email, Guid shelfId, Guid shelfBookId, Guid newShelfId)
    {
        throw new NotImplementedException();
    }

    public Task RemoveShelfBook(string email, Guid shelfId, Guid shelfBookId)
    {
        throw new NotImplementedException();
    }

    public Task ReOrderShelfBook(string email, Guid shelfId, Guid shelfBookId, int newOrder)
    {
        throw new NotImplementedException();
    }

    public Task UpdateShelfBook(string email, ShelfBook shelfBook)
    {
        throw new NotImplementedException();
    }
}
