namespace Pluteo.Domain.Models.Dto.Users;
public class LoginResponse
{
    public required string AccessToken { get; set; }
    public required int ExpiresIn { get; set; }
}
