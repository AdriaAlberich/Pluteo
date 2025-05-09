using Pluteo.Domain.Models.Dto.ShelfBooks;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Systems;
public interface IShelfBookSystem
{
    Task AddShelfBook(string email, Guid shelfId, ShelfBook shelfBook);
    Task RemoveShelfBook(string email, Guid shelfId, Guid shelfBookId);
    Task<ShelfBook> GetShelfBook(string email, Guid shelfId, Guid shelfBookId);
    Task ReOrderShelfBook(string email, Guid shelfId, Guid shelfBookId, int newOrder);
    Task MoveShelfBook(string email, Guid shelfId, Guid shelfBookId, Guid newShelfId);
    Task UpdateShelfBook(string email, Guid shelfId, Guid shelfBookId, ShelfBookDetails request);
    Task ActivateShelfBookLoan(string email, Guid shelfId, Guid shelfBookId, ActivateShelfBookLoanRequest request);
    Task DeactivateShelfBookLoan(string email, Guid shelfId, Guid shelfBookId);
    Task<bool> IsShelfBookLoanActive(string email, Guid shelfId, Guid shelfBookId);
    Task SendLoanNotification(User user, ShelfBook shelfBook);
    Task SendLoanNotifications();
}
