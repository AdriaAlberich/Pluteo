using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using ILogger = Serilog.ILogger;
using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Infrastructure.Utils;
using Pluteo.Domain.Models.Dto.Users;
using Pluteo.Domain.Models.Settings;
using System.Security.Claims;
using Microsoft.Extensions.Options;

namespace Pluteo.Infrastructure.Controllers;
[ApiController]
[Produces("application/json")]
[Route("api/users")]
public class UserController(UserService userService, IWebHostEnvironment env, ILogger logger, IMapper mapper, IOptions<ApplicationSettings> config) : Controller
{
    private readonly UserService _userService = userService;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config.Value;

    #region User Endpoints

    [AllowAnonymous]
    [HttpPost()]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            await _userService.Register(request.Email, request.Password, request.PasswordRepeat);

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

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var accessToken = await _userService.Login(request.Email, request.Password);
            
            if (string.IsNullOrWhiteSpace(accessToken))
                return Unauthorized("LOGIN_TOKEN_MISSING");

            return Ok(new LoginResponse { AccessToken = accessToken, ExpiresIn = _config.AccessTokenExpireMinutes * 60 });
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

    [AllowAnonymous]
    [HttpPatch("activate")]
    public async Task<ActionResult> Activate([FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("TOKEN_NULL");
            
            await _userService.ActivateUser(token);

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

    [AllowAnonymous]
    [HttpPatch("resend-activation")]
    public async Task<ActionResult> ResendActivation([FromQuery] string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("EMAIL_NULL");

            await _userService.SendUserActivation(email);

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

    [AllowAnonymous]
    [HttpPatch("lost-password")]
    public async Task<ActionResult> LostPassword([FromQuery] string email)
    {
        try
        {
            await _userService.SendUserResetPassword(email);

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

    [AllowAnonymous]
    [HttpPatch("reset-password")]
    public async Task<ActionResult> ResetPassword([FromQuery] string token, [FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.NewPasswordRepeat))
                return BadRequest("PASSWORD_REQUEST_NOT_VALID");

            await _userService.ResetPassword(token, request.NewPassword, request.NewPasswordRepeat);

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
    [HttpPatch("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.NewPasswordRepeat))
                return BadRequest("PASSWORD_REQUEST_NOT_VALID");

            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _userService.ChangePasswordByEmail(userEmail, request.CurrentPassword, request.NewPassword, request.NewPasswordRepeat);

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
    [HttpGet("settings")]
    public async Task<ActionResult> GetUserSettings()
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            return Ok(await _userService.GetUserSettings(userEmail));
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
    [HttpPatch("settings")]
    public async Task<ActionResult> GetUserSettings([FromBody] UserSettingsUpdateRequest request)
    {
        try
        {
            var userEmail = GetUserEmail(User);

            if (string.IsNullOrWhiteSpace(userEmail))
                return BadRequest("USER_EMAIL_NULL");

            await _userService.UpdateUserSettings(userEmail, request);

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

    #region Admin Endpoints

    [Authorize(Roles = "Admin")]
    [HttpGet()]
    public async Task<ActionResult> List()
    {
        try
        {
            return Ok(_mapper.Map<List<UserResponse>>(await _userService.List()));
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

    [Authorize(Roles = "Admin")]
    [HttpGet("{userId}")]
    public async Task<ActionResult> Get(Guid userId)
    {
        try
        {
            return Ok(_mapper.Map<UserResponse>(await _userService.GetById(userId)));
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

    [Authorize(Roles = "Admin")]
    [HttpPatch("{userId}")]
    public async Task<ActionResult> Update(Guid userId, [FromBody] UserUpdateRequest userData)
    {
        try
        {
            await _userService.UpdateFromRequest(userId, userData);
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

    [Authorize(Roles = "Admin")]
    [HttpDelete("{userId}")]
    public async Task<ActionResult> Delete(Guid userId)
    {
        try
        {
            await _userService.Delete(userId);
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

    [Authorize(Roles = "Admin")]
    [HttpPost("{userId}/addrole/{role}")]
    public async Task<ActionResult> AddRole(Guid userId, string role)
    {
        try
        {
            await _userService.AddRole(userId, role);
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

    [Authorize(Roles = "Admin")]
    [HttpPost("{userId}/removerole/{role}")]
    public async Task<ActionResult> RemoveRole(Guid userId, string role)
    {
        try
        {
            await _userService.RemoveRole(userId, role);
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
