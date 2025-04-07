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
public class UserService(ApplicationSettings config, ILogger logger, IBaseRepository<User, Guid> userRepository, ITokenGenerator tokenGenerator, IPasswordValidator passwordValidator, IPasswordCipher passwordCipher, IResourceManager localizationManager, IEmailSender emailSender) : IUserService
{
    private readonly ApplicationSettings _config = config;
    private readonly ILogger _logger = logger;
    private readonly IBaseRepository<User, Guid> _userRepository = userRepository;
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;
    private readonly IPasswordValidator _passwordValidator = passwordValidator;
    private readonly IPasswordCipher _passwordCipher = passwordCipher;
    private readonly IResourceManager _localizationManager = localizationManager;
    private readonly IEmailSender _emailSender = emailSender;

    public async Task<User> Create(string email, string password)
    {
        User newUser = new()
        {
            Id = Guid.NewGuid(),
            Email = email,
            Password = _passwordCipher.Encrypt(password),
            Roles = [UserRoles.Roles[0]], // Default role is User
            Notifications = [],
            Settings = new()
            {
                NotifyByEmail = _config.DefaultNotifyByEmail,
                NotifyLoan = _config.DefaultNotifyLoan,
                NotifyLoanBeforeDays = _config.DefaultNotifyLoanBeforeDays,
                NotifyLoanBeforeDaysFrequency = _config.DefaultNotifyLoanBeforeDaysFrequency,
                Locale = _config.DefaultLocale
            }
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

        await SendUserActivation(newUser.Email);
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
        var user = await GetUserByEmail(email) ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");

        user.ActivationToken = _tokenGenerator.GenerateRandomToken();

        await Update(user);

        Dictionary<string,string> dynamicFields = new()
        {
            { "activation_url", $"{_config.ApplicationUrl}/users/activate?token={Uri.EscapeDataString(user.ActivationToken)}" }
        };

        await _emailSender.SendEmail(_localizationManager.GetStringFormatted(user.Settings.Locale, "UserActivationEmailSubject", _config.ApplicationName), $"activation_{user.Settings.Locale}", user.Email, dynamicFields);

        _logger.Information("Sent activation email to {Email} ({Id})", user.Email, user.Id);
    }

    public async Task ActivateUser(string email, string token)
    {
        User user = await GetUserByEmail(email) ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");

        if(user.ActivationToken != token)
            throw new ServiceException("USER_ACTIVATION_TOKEN_NOT_VALID");

        user.ActivationToken = string.Empty;

        await Update(user);

        _logger.Information("User {Email} ({Id}) has been activated by token", user.Email, user.Id);
    }

    public async Task AddRole(Guid userId, string role)
    {
        if(!UserRoles.Roles.Contains(role))
            throw new ServiceException("USER_ROLE_NOT_VALID");

        User user = await GetById(userId) ?? throw new ServiceException("USER_NOT_EXISTS");
        if (user.Roles.Contains(role))
            throw new ServiceException("USER_ALREADY_HAS_ROLE");

        user.Roles.Add(role);

        await Update(user);
        _logger.Information("User {Email} ({Id}) has been assigned role {Role}", user.Email, user.Id, role);
    }

    public async Task RemoveRole(Guid userId, string role)
    {
        if(!UserRoles.Roles.Contains(role))
            throw new ServiceException("USER_ROLE_NOT_VALID");

        User user = await GetById(userId) ?? throw new ServiceException("USER_NOT_EXISTS");
        if (!user.Roles.Contains(role))
            throw new ServiceException("USER_DOES_NOT_HAVE_ROLE");

        user.Roles.Remove(role);

        await Update(user);
        _logger.Information("User {Email} ({Id}) has been removed role {Role}", user.Email, user.Id, role);
    }

    public async Task ChangePassword(User user, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        if(string.IsNullOrWhiteSpace(user.Password))
            throw new ServiceException("USER_PASSWORD_HASH_EMPTY");

        (bool verified, bool needsUpgrade) = _passwordCipher.Check(user.Password, currentPassword);

        if (!verified)
            throw new ServiceException("USER_PASSWORD_INCORRECT");

        if(!await CheckPasswordValid(newPassword))
            throw new ServiceException("USER_NEW_PASSWORD_NOT_VALID");

        if(newPassword != newPasswordRepeat)
            throw new ServiceException("USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH");

        user.Password = _passwordCipher.Encrypt(newPassword);

        await Update(user);

        _logger.Information("{Email} ({Id}) changed his password", user.Email, user.Id);
    }

    public async Task ChangePasswordByEmail(string email, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        var user = await GetUserByEmail(email) ?? throw new ServiceException("USER_NOT_EXISTS");
        await ChangePassword(user, currentPassword, newPassword, newPasswordRepeat);
    }

    public async Task ChangePasswordById(Guid userId, string currentPassword, string newPassword, string newPasswordRepeat)
    {
        var user = await GetById(userId) ?? throw new ServiceException("USER_NOT_EXISTS");
        await ChangePassword(user, currentPassword, newPassword, newPasswordRepeat);
    }

    public async Task SendUserResetPassword(string email)
    {
        var user = await GetUserByEmail(email) ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");

        user.ResetPasswordToken = _tokenGenerator.GenerateRandomToken();

        await Update(user);

        Dictionary<string,string> dynamicFields = new()
        {
            { "resetpassword_url", $"{_config.ApplicationUrl}/users/resetpassword?token={Uri.EscapeDataString(user.ResetPasswordToken)}" }
        };

        await _emailSender.SendEmail(_localizationManager.GetStringFormatted(user.Settings.Locale, "UserResetPasswordEmailSubject", _config.ApplicationName), $"resetpassword_{user.Settings.Locale}", user.Email, dynamicFields);

        _logger.Information("Sent password reset email to {Email} ({Id})", user.Email, user.Id);
    }

    public async Task ResetPassword(string email, string token, string newPassword, string newPasswordRepeat)
    {
        User user = await GetUserByEmail(email) ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");

        if(user.ResetPasswordToken != token)
            throw new ServiceException("USER_RESET_PASSWORD_TOKEN_NOT_VALID");

        if(!await CheckPasswordValid(newPassword))
            throw new ServiceException("USER_NEW_PASSWORD_NOT_VALID");

        if(newPassword != newPasswordRepeat)
            throw new ServiceException("USER_NEW_PASSWORD_CONFIRMATION_NOT_MATCH");

        user.Password = _passwordCipher.Encrypt(newPassword);

        user.ResetPasswordToken = string.Empty;

        await Update(user);

        _logger.Information("Password reset for user {Email} ({Id})", user.Email, user.Id);
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

    public Task<UserSettingsResponse> GetUserSettings(string email)
    {
        var user = GetUserByEmail(email).Result ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");

        return Task.FromResult(new UserSettingsResponse
        {
            Email = user.Email,
            NotifyByEmail = user.Settings.NotifyByEmail,
            NotifyLoan = user.Settings.NotifyLoan,
            NotifyLoanBeforeDays = user.Settings.NotifyLoanBeforeDays,
            NotifyLoanBeforeDaysFrequency = user.Settings.NotifyLoanBeforeDaysFrequency,
            Locale = user.Settings.Locale
        });
    }

    public async Task UpdateUserSettings(string email, UserSettingsUpdateRequest request)
    {
        var user = GetUserByEmail(email).Result ?? throw new ServiceException("USER_EMAIL_NOT_FOUND");
        bool isUpdated = false;

        if(request.NotifyByEmail.HasValue && request.NotifyByEmail.Value && !user.Settings.NotifyByEmail)
        {
            user.Settings.NotifyByEmail = request.NotifyByEmail.Value;
            isUpdated = true;
        }

        if(request.NotifyLoan.HasValue && request.NotifyLoan.Value && !user.Settings.NotifyLoan)
        {
            user.Settings.NotifyLoan = request.NotifyLoan.Value;
            isUpdated = true;
        }

        if(request.NotifyLoanBeforeDays.HasValue)
        {
            if(request.NotifyLoanBeforeDays < _config.MinNotifyLoanBeforeDays || request.NotifyLoanBeforeDays > _config.MaxNotifyLoanBeforeDays)
                throw new ServiceException("USER_NOTIFY_LOAN_BEFORE_DAYS_NOT_VALID");

            user.Settings.NotifyLoanBeforeDays = request.NotifyLoanBeforeDays.Value;

            isUpdated = true;
        }

        if(request.NotifyLoanBeforeDaysFrequency.HasValue)
        {
            if(request.NotifyLoanBeforeDaysFrequency < _config.MinNotifyLoanBeforeDaysFrequency || request.NotifyLoanBeforeDaysFrequency > _config.MaxNotifyLoanBeforeDaysFrequency)
                throw new ServiceException("USER_NOTIFY_LOAN_BEFORE_DAYS_FREQUENCY_NOT_VALID");

            user.Settings.NotifyLoanBeforeDaysFrequency = request.NotifyLoanBeforeDaysFrequency.Value;

            isUpdated = true;
        }
            
        if(!string.IsNullOrWhiteSpace(request.Locale))
        {
            if(!Localizations.Locales.Contains(request.Locale))
                throw new ServiceException("USER_LOCALE_NOT_VALID");

            user.Settings.Locale = request.Locale;

            isUpdated = true;
        }

        if(isUpdated)
        {
            await Update(user);
            _logger.Information("User {Email} ({Id}) updated his settings", user.Email, user.Id);
        }
        else
            _logger.Information("User {Email} ({Id}) has no changes to update his settings", user.Email, user.Id);
    }
}
