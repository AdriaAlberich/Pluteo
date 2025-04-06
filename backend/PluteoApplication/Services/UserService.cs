using ILogger = Serilog.ILogger;
using Pluteo.Domain.Interfaces.Services;
using Pluteo.Domain.Models.Settings;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Static;
using Pluteo.Domain.Exceptions;
using System.Text.RegularExpressions;
using Pluteo.Domain.Models.Dto.Users;

namespace Pluteo.Application.Services;
public class UserService(ApplicationSettings config, ILogger logger, IBaseRepository<User, Guid> userRepository, ITokenGenerator tokenGenerator, IPasswordValidator passwordValidator, IPasswordCipher passwordCipher) : IUserService
{
    private readonly ApplicationSettings _config = config;
    private readonly ILogger _logger = logger;
    private readonly IBaseRepository<User, Guid> _userRepository = userRepository;
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;
    private readonly IPasswordValidator _passwordValidator = passwordValidator;
    private readonly IPasswordCipher _passwordCipher = passwordCipher;

    public async Task<User> Create(string email, string password)
    {
        User newUser = new()
        {
            Id = Guid.NewGuid(),
            Email = email,
            Password = _passwordCipher.Encrypt(password),
            //ActivationToken = _tokenGenerator.GenerateRandomToken(),
            Roles = [UserRoles.Roles[0]], // Default role is User
        };

        await _userRepository.Create(newUser);

        _logger.Information("New user {Email} ({Id}) has been registered.", newUser.Email, newUser.Id);

        return newUser;
    }

    public async Task Update(User user)
    {
        await _userRepository.Update(user);

        _logger.Information("User {Email} ({Id}) has been updated.", user.Email, user.Id);
    }

    public async Task UpdateFromRequest(Guid userId, UserUpdateRequest userUpdateRequest)
    {
        if(userUpdateRequest == null)
            throw new ServiceException("USER_UPDATE_REQUEST_NULL");

        User user = await GetById(userId);
        if(user == null)
            throw new ServiceException("USER_NOT_EXISTS");
        
        bool isUpdated = false;
        if(!string.IsNullOrWhiteSpace(userUpdateRequest.Email) && userUpdateRequest.Email != user.Email)
        {
            await CheckEmail(userUpdateRequest.Email);
            user.Email = userUpdateRequest.Email;
            isUpdated = true;
        }

        if(isUpdated)
            await Update(user);
        else
            _logger.Information("User {Email} ({Id}) has no changes to update.", user.Email, user.Id);
    }

    public async Task Delete(Guid userId)
    {
        await _userRepository.Delete(userId);

        _logger.Information("User with ID ({Id}) has been deleted from database", userId);
    }

    public async Task<User> GetById(Guid userId)
    {
        return await _userRepository.GetById(userId);
    }

    public async Task<List<User>> List()
    {
        return await _userRepository.List();
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        List<User> users = await _userRepository.List();

        return users.Find(x => x.Email == email);
    }

    public async Task Register(string email, string password, string passwordRepeat)
    {
        await CheckEmail(email);

        if(!await CheckPasswordValid(password))
            throw new ServiceException("USER_NEW_PASSWORD_NOT_VALID");

        if(password != passwordRepeat)
            throw new ServiceException("USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH");

        User newUser = await Create(email, password);

        //await SendUserActivation(newUser.Email);
    }

    public async Task<string> Login(string email, string password)
    {
        if(!await CheckEmailValid(email))
            throw new ServiceException("USER_EMAIL_NOT_VALID");

        if(!await CheckPasswordValid(password))
            throw new ServiceException("USER_PASSWORD_NOT_VALID");

        List<User> users = await _userRepository.List();

        var user = users.Find(x => x.Email == email);

        if(user == null)
            throw new ServiceException("USER_NOT_EXISTS");

        if(string.IsNullOrWhiteSpace(user.Password))
            throw new ServiceException("USER_PASSWORD_HASH_EMPTY");
        
        (bool verified, bool needsUpgrade) = _passwordCipher.Check(user.Password, password);

        if (!verified)
            throw new ServiceException("USER_PASSWORD_INCORRECT");

        if(needsUpgrade)
            throw new ServiceException("USER_PASSWORD_EXPIRED");

        if(!string.IsNullOrWhiteSpace(user.ActivationToken)) 
            throw new ServiceException("USER_NOT_ACTIVE");

        if(string.IsNullOrWhiteSpace(user.Email) || user.Roles == null || user.Roles.Count == 0)
            throw new ServiceException("USER_MISSING_DATA");

        string accessToken = _tokenGenerator.GenerateAccessToken(user.Email, user.Roles);

        _logger.Information("User {Email} ({Id}) logged in", user.Email, user.Id);
        return accessToken;
    }

    public async Task SendUserActivation(string email)
    {
        throw new NotImplementedException();
    }

    public async Task ActivateUser(string token)
    {
        throw new NotImplementedException();
    }

    public async Task SetRole(Guid userId, string role)
    {
        throw new NotImplementedException();
    }

    public async Task RemoveRole(Guid userId, string role)
    {
        throw new NotImplementedException();
    }

    public async Task ChangePassword(User user, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        throw new NotImplementedException();
    }

    public async Task ChangePasswordByEmail(string email, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        throw new NotImplementedException();
    }

    public async Task ChangePasswordById(Guid userId, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        throw new NotImplementedException();
    }

    public async Task ResetPassword(string token, string newPassword, string newPasswordRepeat)
    {
        throw new NotImplementedException();
    }

    public async Task SendUserResetPassword(string email)
    {
        throw new NotImplementedException();
    }

    public async Task CheckEmail(string email)
    {
        if(!await CheckEmailValid(email))
            throw new ServiceException("USER_EMAIL_NOT_VALID");

        List<User> users = await _userRepository.List();

        var user = users.Find(x => x.Email == email);

        if(user != null)
            throw new ServiceException("USER_EMAIL_EXISTS");
    }

    public async Task<bool> CheckEmailValid(string email)
    {
        Regex pattern = new(_config.EmailPattern);

        return await Task.Run(() => email.Length <= _config.EmailLimit && pattern.Match(email).Success);
    }

    public async Task<bool> CheckPasswordValid(string password)
    {
        return await Task.Run(() => _passwordValidator.IsValid(password));
    }
}
