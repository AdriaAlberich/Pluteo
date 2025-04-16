namespace Pluteo.Domain.Models.Entities;
public class Shelf
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required bool IsDefault { get; set; }
    public required bool IsReadQueue { get; set; }
    public required int Order { get; set; }

    public required List<ShelfBook> Books { get; set; }
}