using Pluteo.Domain.Models.Dto.Shelves;

namespace Pluteo.Domain.Models.Dto.Library;
public class AddBookRequest
{
    public required string ISBN { get; set; }
    public Guid? ShelfId { get; set; }
}