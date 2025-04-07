namespace Pluteo.Domain.Models.Settings;
public sealed class ApplicationSettings
{
    public required string DefaultLocale { get; set; }
    public required string JwtKey { get; set; }
    public required int AccessTokenExpireMinutes { get; set; }
    public required int PasswordIterations { get; set; }
    public required int PasswordLimit { get; set; }
    public required string PasswordPattern { get; set; }
    public required int EmailLimit { get; set; }
    public required string EmailPattern { get; set; }
}

