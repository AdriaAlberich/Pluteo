using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure.AutoMapperProfiles;
using MongoDB.Driver;

namespace Pluteo.Infrastructure;
public class Startup(IConfiguration configuration)
{
    public IConfiguration ConfigRoot
    {
        get;
    } = configuration;

    public void ConfigureServices(IServiceCollection services) 
    {

        // Register config files
        Console.WriteLine($"Registering config files...");
        services.Configure<ApplicationSettings>(ConfigRoot.GetSection("ApplicationSettings"));
        services.Configure<DatabaseSettings>(ConfigRoot.GetSection("DatabaseSettings"));

        // MongoDB Service configuration
        Console.WriteLine($"Configuring MongoDB Service...");
        services.AddSingleton<IMongoClient>(s => 
            new MongoClient(ConfigRoot.GetSection("DatabaseSettings").GetValue<string>("ConnectionString"))
        );

        // Register AutoMapper profiles
        services.AddAutoMapper(typeof(UserProfile));
    }
}