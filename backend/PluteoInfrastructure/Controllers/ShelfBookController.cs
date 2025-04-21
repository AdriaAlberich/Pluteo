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
using Pluteo.Domain.Models.Dto.ShelfBooks;

namespace Pluteo.Infrastructure.Controllers;
[ApiController]
[Produces("application/json")]
[Route("api/shelfbooks")]
public class ShelfBookController(ShelfBookSystem shelfBookSystem, IWebHostEnvironment env, ILogger logger, IMapper mapper, IOptions<ApplicationSettings> config) : Controller
{
    private readonly ShelfBookSystem _shelfBookSystem = shelfBookSystem;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config.Value;

    #region User Endpoints

    [Authorize(Roles = "User")]
    [HttpGet("{shelfId}/{shelfBookId}")]
    public async Task<ActionResult> GetShelfBook(Guid shelfId, Guid shelfBookId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            var shelfBook = await _shelfBookSystem.GetShelfBook(userEmail, shelfId, shelfBookId);
            return Ok(shelfBook);
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
    [HttpPatch("{shelfId}/{shelfBookId}/move/{newShelfId}")]
    public async Task<ActionResult> RemoveShelf(Guid shelfId, Guid shelfBookId, Guid newShelfId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfBookSystem.MoveShelfBook(userEmail, shelfId, shelfBookId, newShelfId);

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
    [HttpDelete("{shelfId}/{shelfBookId}")]
    public async Task<ActionResult> RemoveShelfBook(Guid shelfId, Guid shelfBookId)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfBookSystem.RemoveShelfBook(userEmail, shelfId, shelfBookId);

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
    [HttpPatch("{shelfId}/{shelfBookId}/new-order")]
    public async Task<ActionResult> ReOrderShelfBook(Guid shelfId, Guid shelfBookId, [FromBody] int newOrder)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _shelfBookSystem.ReOrderShelfBook(userEmail, shelfId, shelfBookId, newOrder);

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
    [HttpPatch("{shelfId}/{shelfBookId}")]
    public async Task<ActionResult> UpdateShelfBook(Guid shelfId, Guid shelfBookId, [FromBody] CreateUpdateShelfBook request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            if (request == null)
                return BadRequest("SHELF_BOOK_UPDATE_CANNOT_BE_NULL");

            await _shelfBookSystem.UpdateShelfBook(userEmail, shelfId, shelfBookId, request);

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
