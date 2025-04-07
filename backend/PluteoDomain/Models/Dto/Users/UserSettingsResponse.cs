namespace Pluteo.Domain.Models.Dto.Users;
public class UserSettingsResponse
{
    public required string Email { get; set; }
    public required bool NotifyByEmail { get; set; }
    public required bool NotifyLoan { get; set; }
    public required int NotifyLoanBeforeDays { get; set; }
    public required int NotifyLoanBeforeDaysFrequency { get; set; }
    public required string Locale { get; set; }
}
