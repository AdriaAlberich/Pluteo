namespace Pluteo.Domain.Models.Settings;
public sealed class DatabaseSettings
{
    public required string ConnectionString { get; set; }
    public required string DatabaseName { get; set; }
    public required string UserCollectionName { get; set; }
}
