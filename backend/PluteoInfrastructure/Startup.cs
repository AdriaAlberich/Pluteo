using System.Text;
using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure.AutoMapperProfiles;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using AutoMapper;
using Microsoft.Extensions.Options;
using Pluteo.Infrastructure.Repositories;
using Pluteo.Infrastructure.Utils;
using Pluteo.Application.Services;
using ILogger = Serilog.ILogger;
using Pluteo.Domain.Interfaces;
using Pluteo.Infrastructure.Integrations;
using Pluteo.Application.Systems;

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
        Console.WriteLine($"Registering Config Files...");
        services.Configure<ApplicationSettings>(ConfigRoot.GetSection("ApplicationSettings"));
        services.Configure<DatabaseSettings>(ConfigRoot.GetSection("DatabaseSettings"));
        services.Configure<EmailSettings>(ConfigRoot.GetSection("EmailSettings"));
        services.Configure<OpenLibrarySettings>(ConfigRoot.GetSection("OpenLibrarySettings"));

        // MongoDB Service configuration
        Console.WriteLine($"Configuring MongoDB Client...");
        services.AddSingleton<IMongoClient>(s => 
            new MongoClient(ConfigRoot.GetSection("DatabaseSettings").GetValue<string>("ConnectionString"))
        );

        // Localization manager
        Console.WriteLine($"Initializing Localization Manager...");
        services.AddSingleton<IResourceManager>(s =>
        {
            var logger = s.GetRequiredService<ILogger>();
            return new JsonResourceManager(logger);
        });

        // Register AutoMapper profiles
        services.AddAutoMapper(typeof(UserProfile));
        services.AddAutoMapper(typeof(BookProfile));

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

        // Register UserService as Scoped
        Console.WriteLine($"Adding UserService...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var databaseSettings = s.GetRequiredService<IOptions<DatabaseSettings>>();
            var emailSettings = s.GetRequiredService<IOptions<EmailSettings>>();
            var mongoClient = s.GetRequiredService<IMongoClient>();
            var mapper = s.GetRequiredService<IMapper>();
            var logger = s.GetRequiredService<ILogger>();
            var localizationManager = s.GetRequiredService<IResourceManager>();

            UserRepository repository = new(databaseSettings.Value, mongoClient, mapper);
            TokenGenerator tokenGenerator = new(applicationSettings.Value);
            PasswordValidator passwordValidator = new(applicationSettings.Value);
            PasswordCipher passwordCipher = new(applicationSettings.Value);
            EmailSender emailSender = new(emailSettings.Value);

            UserService service = new(applicationSettings.Value, logger, repository, tokenGenerator, passwordValidator, passwordCipher, localizationManager, emailSender);

            return service;
        });

        // Register NotificationSystem as Scoped
        Console.WriteLine($"Adding NotificationSystem...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var emailSettings = s.GetRequiredService<IOptions<EmailSettings>>();
            var userService = s.GetRequiredService<UserService>();
            var logger = s.GetRequiredService<ILogger>();
            var localizationManager = s.GetRequiredService<IResourceManager>();

            EmailSender emailSender = new(emailSettings.Value);

            NotificationSystem notificationSystem = new(applicationSettings.Value, userService, logger, emailSender, localizationManager);

            return notificationSystem;
        });

        // Register BookService as Scoped
        Console.WriteLine($"Adding BookService...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var logger = s.GetRequiredService<ILogger>();
            var mongoClient = s.GetRequiredService<IMongoClient>();
            var databaseSettings = s.GetRequiredService<IOptions<DatabaseSettings>>();
            var mapper = s.GetRequiredService<IMapper>();

            BookRepository repository = new(databaseSettings.Value, mongoClient, mapper);
            BookService service = new(applicationSettings.Value, logger, repository);

            return service;
        });

        // Register ShelfSystem as Scoped
        Console.WriteLine($"Adding ShelfSystem...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var userService = s.GetRequiredService<UserService>();
            var logger = s.GetRequiredService<ILogger>();

            ShelfSystem shelfSystem = new(applicationSettings.Value, userService, logger);

            return shelfSystem;
        });

        // Register ShelfBookSystem as Scoped
        Console.WriteLine($"Adding ShelfBookSystem...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var userService = s.GetRequiredService<UserService>();
            var notificationSystem = s.GetRequiredService<NotificationSystem>();
            var localizationManager = s.GetRequiredService<IResourceManager>();
            var logger = s.GetRequiredService<ILogger>();

            ShelfBookSystem shelfBookSystem = new(applicationSettings.Value, userService, notificationSystem, localizationManager, logger);

            return shelfBookSystem;
        });

        // Register LibrarySystem as Scoped
        Console.WriteLine($"Adding LibrarySystem...");
        services.AddScoped(s => 
        {
            var applicationSettings = s.GetRequiredService<IOptions<ApplicationSettings>>();
            var userService = s.GetRequiredService<UserService>();
            var bookService = s.GetRequiredService<BookService>();
            var logger = s.GetRequiredService<ILogger>();
            var externalLibrarySettings = s.GetRequiredService<IOptions<OpenLibrarySettings>>();

            OpenLibrary externalLibrary = new(externalLibrarySettings.Value);

            LibrarySystem librarySystem = new(applicationSettings.Value, userService, bookService, externalLibrary, logger);

            return librarySystem;
        });
    }
}