using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("Configuring logger...");
Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
            .CreateLogger();

builder.Services.AddSingleton(Log.Logger);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

Console.WriteLine("Configuring services...");
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// CORS policy
builder.Services.AddCors(options =>
{
    ApplicationSettings? config = builder.Configuration.GetSection("ApplicationSettings").Get<ApplicationSettings>() ?? throw new MissingFieldException("ApplicationSettings is not present");
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(config.ApplicationUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
Console.WriteLine("Starting Routing...");
app.UseRouting();
Console.WriteLine("Starting Authentication...");
app.UseAuthentication();
Console.WriteLine("Starting Authorization...");
app.UseAuthorization();
Console.WriteLine("Mapping Controllers...");
app.MapControllers();
Console.WriteLine("Starting Application...");
app.Run();

