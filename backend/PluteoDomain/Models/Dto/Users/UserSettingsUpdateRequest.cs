namespace Pluteo.Domain.Models.Dto.Users;
public class UserSettingsUpdateRequest
{
    public bool? NotifyByEmail { get; set; }
    public bool? NotifyLoan { get; set; }
    public int? NotifyLoanBeforeDays { get; set; }
    public int? NotifyLoanBeforeDaysFrequency { get; set; }
    public string? Locale { get; set; }
}
