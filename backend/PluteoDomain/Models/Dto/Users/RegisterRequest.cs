namespace Pluteo.Domain.Models.Dto.Users;
public class RegisterRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string PasswordRepeat { get; set; }
}
