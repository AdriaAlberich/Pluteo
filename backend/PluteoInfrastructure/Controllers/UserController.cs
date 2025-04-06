using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using AutoMapper;
using ILogger = Serilog.ILogger;
using System.Security.Claims;
using Pluteo.Application.Services;
using Pluteo.Domain.Exceptions;
using Pluteo.Infrastructure.Utils;
using Pluteo.Domain.Models.Dto.Users;
using Pluteo.Domain.Models.Settings;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Infrastructure.Controllers;
[Route("api/users")]
public class UserController(UserService userService, IWebHostEnvironment env, ILogger logger, IMapper mapper, ApplicationSettings config) : Controller
{
    private readonly UserService _userService = userService;
    private readonly ILogger _logger = logger;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMapper _mapper = mapper;
    private readonly ApplicationSettings _config = config;

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

    #endregion
}
