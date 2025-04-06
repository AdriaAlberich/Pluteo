using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Settings;

namespace Pluteo.Infrastructure.Utils;
public class TokenGenerator(ApplicationSettings applicationSettings) : ITokenGenerator
{
    private readonly string _jwtKey = applicationSettings.JwtKey;

    private readonly int _accessTokenExpireMinutes = applicationSettings.AccessTokenExpireMinutes;

    public string GenerateAccessToken(string email, List<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        var tokenKey = Encoding.ASCII.GetBytes(_jwtKey);
        
        List<Claim> claims =
        [
            new Claim(ClaimTypes.Email, email)
        ];

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        
        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            
            Subject = new ClaimsIdentity(claims),

            Expires = DateTime.UtcNow.AddMinutes(_accessTokenExpireMinutes),

            SigningCredentials = new SigningCredentials 
            (
                new SymmetricSecurityKey(tokenKey),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string GenerateRandomToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
