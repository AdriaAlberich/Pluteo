namespace Pluteo.Domain.Models.Dto.Users;
public class UserResponse
{
    public required string Email { get; set; }
    public required List<string> Roles { get; set; }
}
