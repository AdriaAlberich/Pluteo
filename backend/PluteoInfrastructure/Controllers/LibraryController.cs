using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using ILogger = Serilog.ILogger;
using Pluteo.Domain.Exceptions;
using Pluteo.Infrastructure.Utils;
using Pluteo.Domain.Models.Settings;
using System.Security.Claims;
using Pluteo.Application.Systems;
using Microsoft.Extensions.Options;
using Pluteo.Domain.Models.Dto.Library;

namespace Pluteo.Infrastructure.Controllers;
[ApiController]
[Produces("application/json")]
[Route("api/library")]
public class LibraryController(LibrarySystem librarySystem, IWebHostEnvironment env, ILogger logger, IMapper mapper, IOptions<ApplicationSettings> config) : Controller
{
    private readonly LibrarySystem _librarySystem = librarySystem;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config.Value;

    #region User Endpoints
    
    [Authorize(Roles = "User")]
    [HttpGet()]
    public async Task<ActionResult> GetLibrary([FromQuery] string? filter = null)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            return Ok(await _librarySystem.GetLibrary(userEmail, filter));
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
    [HttpGet("search/{searchTerm}/{pageNumber}/{pageSize}/{external}")]
    public async Task<ActionResult> SearchLibrary(string searchTerm, int pageNumber, int pageSize, bool external)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            return Ok(await _librarySystem.SearchNewBooks(searchTerm, pageNumber, pageSize, external));
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
    [HttpPost("add")]
    public async Task<ActionResult> AddBook([FromBody] AddBookRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _librarySystem.AddBook(userEmail, request.ISBN, request.ShelfId);

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
    [HttpPost("add-manually")]
    public async Task<ActionResult> AddBookManually([FromBody] AddBookManuallyRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _librarySystem.AddBookManually(userEmail, request.Book, request.ShelfId);

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
