using Pluteo.Domain.Models.Dto.Shelves;

namespace Pluteo.Domain.Models.Dto.Library;
public class LibraryOverview
{
    public List<ShelfOverview>? Shelves { get; set; }
}