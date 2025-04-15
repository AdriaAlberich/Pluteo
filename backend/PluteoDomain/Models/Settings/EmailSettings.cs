namespace Pluteo.Domain.Models.Settings;
public sealed class EmailSettings
{
    public required string EmailTemplatesDir { get; set; }
    public required string EmailBaseUri { get; set; }
    public required string EmailAPIKey { get; set; }
    public required string EmailDomain { get; set; }
    public required string EmailFromName { get; set; }
    public required string EmailFromEmail { get; set; }
}

