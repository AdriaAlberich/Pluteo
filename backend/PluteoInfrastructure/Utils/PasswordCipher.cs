using System.Security.Cryptography;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Models.Settings;

namespace Pluteo.Infrastructure.Utils;
public sealed class PasswordCipher(ApplicationSettings applicationSettings) : IPasswordCipher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;

    private readonly int _passwordIterations = applicationSettings.PasswordIterations;

    public string Encrypt(string password)
    {
        using var algorithm = new Rfc2898DeriveBytes(
        password,
        SaltSize,
        _passwordIterations,
        HashAlgorithmName.SHA512);
        var key = Convert.ToBase64String(algorithm.GetBytes(KeySize));
        var salt = Convert.ToBase64String(algorithm.Salt);

        return $"{_passwordIterations}.{salt}.{key}";
    }

    public (bool verified, bool needsUpgrade) Check(string hash, string password)
    {
        var parts = hash.Split('.', 3);

        if (parts.Length != 3)
            throw new FormatException("Unexpected hash format. " + 
                "Should be formatted as `{iterations}.{salt}.{hash}`");

        var iterations = Convert.ToInt32(parts[0]);
        var salt = Convert.FromBase64String(parts[1]);
        var _key = Convert.FromBase64String(parts[2]);

        var needsUpgrade = iterations != _passwordIterations;

        using var algorithm = new Rfc2898DeriveBytes(
        password,
        salt,
        iterations,
        HashAlgorithmName.SHA512);
        var keyToCheck = algorithm.GetBytes(KeySize);

        var verified = keyToCheck.SequenceEqual(_key);

        return (verified, needsUpgrade);
    }
}
