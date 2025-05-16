using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface IShelfSystem
{
    Task AddShelf(User user, string name, bool isDefault = false, bool IsReadQueue = false);
    Task AddUserShelf(string email, string name);
    Task UpdateUserShelf(string email, Guid shelfId, string newName);
    Task RemoveUserShelf(string email, Guid shelfId);
    Task ReOrderUserShelf(string email, Guid shelfId, int newOrder);
}
