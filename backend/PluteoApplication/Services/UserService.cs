using ILogger = Serilog.ILogger;
using Pluteo.Domain.Interfaces.Services;
using Pluteo.Domain.Models.Settings;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Entities;

namespace Pluteo.Application.Services;
public class UserService(ApplicationSettings config, ILogger logger, IBaseRepository<User, Guid> userRepository, ITokenGenerator tokenGenerator) : IUserService
{
    private readonly ApplicationSettings _config = config;
    
    private readonly ILogger _logger = logger;

    private readonly IBaseRepository<User, Guid> _userRepository = userRepository;
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;

    public async Task<User> Create(string userName, string email, string password)
    {
        throw new NotImplementedException();
    }

    public async Task Update(User user)
    {
        throw new NotImplementedException();
    }

    public async Task Delete(Guid userId)
    {
        throw new NotImplementedException();
    }

    public async Task<User> GetById(Guid userId)
    {
        throw new NotImplementedException();
    }

    public async Task<List<User>> List()
    {
        throw new NotImplementedException();
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        throw new NotImplementedException();
    }

    public async Task Register(string username, string email, string password, string passwordRepeat)
    {
        throw new NotImplementedException();
    }

    public async Task<(string userName, string accessToken)> Login(string email, string password)
    {
        throw new NotImplementedException();
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
        throw new NotImplementedException();
    }

    public async Task<bool> CheckEmailValid(string email)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> CheckPasswordValid(string password)
    {
        throw new NotImplementedException();
    }
}
