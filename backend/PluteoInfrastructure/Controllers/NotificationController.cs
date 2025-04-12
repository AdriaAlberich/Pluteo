using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using ILogger = Serilog.ILogger;
using Pluteo.Domain.Exceptions;
using Pluteo.Infrastructure.Utils;
using Pluteo.Domain.Models.Dto.Users;
using Pluteo.Domain.Models.Settings;
using System.Security.Claims;
using Pluteo.Application.Systems;
using Microsoft.Extensions.Options;

namespace Pluteo.Infrastructure.Controllers;
[ApiController]
[Produces("application/json")]
[Route("api/notifications")]
public class NotificationController(NotificationSystem notificationSystem, IWebHostEnvironment env, ILogger logger, IMapper mapper, IOptions<ApplicationSettings> config) : Controller
{
    private readonly NotificationSystem _notificationSystem = notificationSystem;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config.Value;

    #region User Endpoints

    [Authorize(Roles = "User")]
    [HttpGet()]
    public async Task<ActionResult> GetUserNotifications()
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            return Ok(await _notificationSystem.GetUserNotifications(userEmail));
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status406NotAcceptable, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpPatch("{notificationId}")]
    public async Task<ActionResult> NotificationUserClick(Guid notificationId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _notificationSystem.NotificationUserClick(userEmail, notificationId);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status406NotAcceptable, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpDelete("{notificationId}")]
    public async Task<ActionResult> RemoveUserNotification(Guid notificationId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _notificationSystem.RemoveUserNotification(userEmail, notificationId);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status406NotAcceptable, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpDelete()]
    public async Task<ActionResult> RemoveUserNotifications()
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _notificationSystem.RemoveUserNotifications(userEmail);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status406NotAcceptable, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }
    
    #endregion

    #region Private methods

        private static string? GetUserEmail(ClaimsPrincipal? user)
        {
            ArgumentNullException.ThrowIfNull(user);

            var emailClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);
            return emailClaim?.Value;
        }

        #endregion
}
