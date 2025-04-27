using Pluteo.Domain.Models.Dto.ShelfBooks;

namespace Pluteo.Domain.Models.Dto.Library;
public class AddBookManuallyRequest
{
    public required CreateUpdateShelfBook Book { get; set; }
    public Guid? ShelfId { get; set; }
}