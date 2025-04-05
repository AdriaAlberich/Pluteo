using Pluteo.Infrastructure;;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

Console.WriteLine($"Configuring logger...");
Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
            .CreateLogger();

builder.Services.AddSingleton(Log.Logger);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

Console.WriteLine($"Configuring services...");
    var startup = new Startup(builder.Configuration);
    startup.ConfigureServices(builder.Services);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.Run();

