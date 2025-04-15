namespace Pluteo.Domain.Models.Settings;
public sealed class ApplicationSettings
{
    public required string ApplicationName { get; set; }
    public required string ApplicationVersion { get; set; }
    public required string ApplicationUrl { get; set; }
    public required string DefaultLocale { get; set; }
    public required string JwtKey { get; set; }
    public required int AccessTokenExpireMinutes { get; set; }
    public required int PasswordIterations { get; set; }
    public required int PasswordLimit { get; set; }
    public required string PasswordPattern { get; set; }
    public required int EmailLimit { get; set; }
    public required string EmailPattern { get; set; }
    public required int UserMaxNotifications { get; set; }
    public required bool DefaultNotifyByEmail { get; set; }
    public required bool DefaultNotifyLoan { get; set; }
    public required int DefaultNotifyLoanBeforeDays { get; set; }
    public required int DefaultNotifyLoanBeforeDaysFrequency { get; set; }
    public required int MinNotifyLoanBeforeDays { get; set; }
    public required int MaxNotifyLoanBeforeDays { get; set; }
    public required int MinNotifyLoanBeforeDaysFrequency { get; set; }
    public required int MaxNotifyLoanBeforeDaysFrequency { get; set; }
}

