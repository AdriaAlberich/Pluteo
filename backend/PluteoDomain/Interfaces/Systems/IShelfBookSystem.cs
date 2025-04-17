using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface IShelfBookSystem
{
    Task AddShelfBook(string email, Guid shelfId, ShelfBook shelfBook);
    Task RemoveShelfBook(string email, Guid shelfId, Guid shelfBookId);
    Task<ShelfBook> GetShelfBook(string email, Guid shelfId, Guid shelfBookId);
    Task ReOrderShelfBook(string email, Guid shelfId, Guid shelfBookId, int newOrder);
    Task MoveShelfBook(string email, Guid shelfId, Guid shelfBookId, Guid newShelfId);
    Task UpdateShelfBook(string email, ShelfBook shelfBook);
}
