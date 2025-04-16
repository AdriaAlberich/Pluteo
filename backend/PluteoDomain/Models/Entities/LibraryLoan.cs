namespace Pluteo.Domain.Models.Entities;
public class LibraryLoan
{
    public required string Library { get; set; }
    public required DateTime LoanDate { get; set; }
    public required DateTime DueDate { get; set; }
    public required bool Notify { get; set; }
    public DateTime? LastNotificationDate { get; set; }
}