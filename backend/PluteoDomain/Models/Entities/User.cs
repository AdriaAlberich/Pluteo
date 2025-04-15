namespace Pluteo.Domain.Models.Entities;
public class User
{
    public required Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required List<string> Roles { get; set; }
    public required List<Notification> Notifications { get; set; }
    public required UserSettings Settings { get; set; }
    public string? ActivationToken { get; set; }
    public string? ResetPasswordToken { get; set; }
}