using Microsoft.Extensions.Options;
using Pluteo.Application.Systems;
using Pluteo.Domain.Models.Settings;
using ILogger = Serilog.ILogger;

namespace Pluteo.Infrastructure.Jobs;
public class LoanNotificationService(IServiceProvider serviceProvider, IOptions<ApplicationSettings> config, ILogger logger) : BackgroundService
{
    private readonly IServiceProvider _serviceProvider = serviceProvider;
    private readonly ApplicationSettings _config = config.Value;
    private readonly ILogger _logger = logger;
    
    /// <summary>
    /// Background service that sends loan notifications to users.
    /// </summary>
    /// <param name="stoppingToken"></param>
    /// <returns></returns>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var shelfBookSystem = scope.ServiceProvider.GetRequiredService<ShelfBookSystem>();

                    await shelfBookSystem.SendLoanNotifications();
                }

                _logger.Information("Loan notifications launched successfully.");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "An error occurred while launching loan notifications.");
            }

            await Task.Delay(TimeSpan.FromSeconds(_config.LoanNotificationJobDelay), stoppingToken);
        }
    }
}