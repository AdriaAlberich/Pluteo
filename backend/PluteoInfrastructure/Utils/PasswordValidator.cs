using System.Text.RegularExpressions;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Models.Settings;

namespace Pluteo.Infrastructure.Utils;
public class PasswordValidator(ApplicationSettings applicationSettings) : IPasswordValidator
{
    private readonly string _passwordPattern = applicationSettings.PasswordPattern;
    private readonly int _passwordLimit = applicationSettings.PasswordLimit;

    public bool IsValid(string password)
    {
        Regex pattern = new(_passwordPattern);
        return password.Length <= _passwordLimit && pattern.Match(password).Success;
    }
}
