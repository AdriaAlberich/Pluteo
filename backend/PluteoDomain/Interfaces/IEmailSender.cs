namespace Pluteo.Domain.Interfaces;
public interface IEmailSender
{
    Task SendEmail(string subject, string template, string recipient, Dictionary<string, string> parameters);
}