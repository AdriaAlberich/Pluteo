namespace Pluteo.Domain.Interfaces.Utils;
public interface IPasswordCipher
{
    string Encrypt(string password);
    (bool verified, bool needsUpgrade) Check(string hash, string password);
}
