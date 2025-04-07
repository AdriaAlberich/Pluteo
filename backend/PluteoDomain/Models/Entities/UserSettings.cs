namespace Pluteo.Domain.Models.Entities;
public class UserSettings
{
    public required bool NotifyByEmail { get; set; }
    public required bool NotifyLoan { get; set; }
    public required int NotifyLoanBeforeDays { get; set; }
    public required int NotifyLoanBeforeDaysFrequency { get; set; }
    public required string Locale { get; set; }
}
