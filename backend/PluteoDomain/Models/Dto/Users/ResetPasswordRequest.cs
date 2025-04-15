namespace Pluteo.Domain.Models.Dto.Users;
public class ResetPasswordRequest
{
    public string? NewPassword { get; set; }
    public string? NewPasswordRepeat { get; set; }
}
