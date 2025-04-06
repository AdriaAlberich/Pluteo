using System.Text;
using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure.AutoMapperProfiles;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;


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

        // Configure Authentication
        Console.WriteLine($"Configuring Authentication...");
        string key = ConfigRoot.GetSection("ApplicationSettings").GetValue<string>("JwtKey") ?? string.Empty;
        if(key == string.Empty)
            throw new MissingFieldException("JwtKey is not present");

        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false; // Change to true in production
            x.SaveToken = true;
            x.TokenValidationParameters = new TokenValidationParameters 
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key)),
                ValidateIssuer = false,
                ValidateAudience = false
            };
        });
    }
}