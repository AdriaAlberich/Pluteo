namespace Pluteo.Domain.Interfaces;
public interface IPasswordCipher
{
    string Encrypt(string password);
    (bool verified, bool needsUpgrade) Check(string hash, string password);
}
