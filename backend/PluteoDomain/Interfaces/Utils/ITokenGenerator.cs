namespace Pluteo.Domain.Interfaces.Utils;
public interface ITokenGenerator
{
    string GenerateAccessToken(string email, List<string> roles);
    string GenerateRandomToken();
}