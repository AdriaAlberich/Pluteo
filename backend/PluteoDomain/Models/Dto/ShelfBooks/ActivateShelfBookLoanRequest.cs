namespace Pluteo.Domain.Models.Dto.ShelfBooks;
public class ActivateShelfBookLoanRequest
{
    public required string Library { get; set; }
    public required DateTime DueDate { get; set; }
}