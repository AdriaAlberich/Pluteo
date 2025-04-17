using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface IShelfSystem
{
    Task AddShelf(string email, Shelf shelf);
    Task AddUserShelf(string email, Shelf shelf);
    Task UpdateUserShelf(string email, string name);
    Task RemoveUserShelf(string email, Guid shelfId);
    Task ReOrderUserShelf(string email, Guid shelfId, int newOrder);
}
