using Pluteo.Domain.Models.Entities;

namespace Pluteo.Domain.Interfaces.Services;
public interface IUserService : IBaseEntityService<User, Guid>
{
        Task<User> Create(string email, string password);
        Task Register(string email, string password, string passwordRepeat);
        Task<string> Login(string email, string password);
        Task SendUserActivation(string email);
        Task ActivateUser(string token);
        Task SetRole(Guid userId, string role);
        Task RemoveRole(Guid userId, string role);
        Task ChangePasswordById(Guid userId, string currentPassword, string newPassword, string newPasswordRepeat);
        Task ChangePasswordByEmail(string email, string currentPassword, string newPassword, string newPasswordRepeat);
        Task ChangePassword(User user, string currentPassword, string newPassword, string newPasswordRepeat);
        Task ResetPassword(string token, string newPassword, string newPasswordRepeat);
        Task SendUserResetPassword(string email);
        Task<bool> CheckPasswordValid(string password);
        Task CheckEmail(string email);
        Task<bool> CheckEmailValid(string email);
        Task<User?> GetUserByEmail(string email);
}
