using Pluteo.Domain.Models.Dto.ShelfBooks;

namespace Pluteo.Domain.Models.Dto.Shelves;
public class ShelfOverview
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public int? Order { get; set; }
    public List<ShelfBookOverview>? Books { get; set; }
}