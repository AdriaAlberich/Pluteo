namespace Pluteo.Domain.Interfaces;
public interface ITokenGenerator
{
    string GenerateAccessToken(string email, List<string> roles);
    string GenerateRandomToken();
}