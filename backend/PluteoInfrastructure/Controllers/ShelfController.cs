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
using Pluteo.Domain.Models.Dto.Shelves;

namespace Pluteo.Infrastructure.Controllers;
[ApiController]
[Produces("application/json")]
[Route("api/shelves")]
public class ShelfController(ShelfSystem shelfSystem, IWebHostEnvironment env, ILogger logger, IMapper mapper, IOptions<ApplicationSettings> config) : Controller
{
    private readonly ShelfSystem _shelfSystem = shelfSystem;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config.Value;

    #region User Endpoints

    [Authorize(Roles = "User")]
    [HttpPost()]
    public async Task<ActionResult> AddShelf([FromBody] AddUpdateShelfRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfSystem.AddUserShelf(userEmail, request.Name);
    
            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status400BadRequest, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpDelete("{shelfId}")]
    public async Task<ActionResult> RemoveShelf(Guid shelfId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfSystem.RemoveUserShelf(userEmail, shelfId);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status400BadRequest, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpPatch("{shelfId}/new-order")]
    public async Task<ActionResult> ReOrderShelf(Guid shelfId, [FromBody] ReOrderShelfRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfSystem.ReOrderUserShelf(userEmail, shelfId, request.Order);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status400BadRequest, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
        }
        catch (Exception e)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ExceptionControl.ProcessException(e, _logger, _env.IsDevelopment(), false));
        }
    }

    [Authorize(Roles = "User")]
    [HttpPatch("{shelfId}")]
    public async Task<ActionResult> UpdateShelf(Guid shelfId, [FromBody] AddUpdateShelfRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfSystem.UpdateUserShelf(userEmail, shelfId, request.Name);

            return Ok();
        }
        catch (ServiceException se)
        {
            return StatusCode(StatusCodes.Status400BadRequest, ExceptionControl.ProcessException(se, _logger, _env.IsDevelopment(), true));
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
