namespace Pluteo.Domain.Models.Dto.Users;
public class ChangePasswordRequest
{
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
    public string? NewPasswordRepeat { get; set; }
}
