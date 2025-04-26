namespace Pluteo.Domain.Interfaces.Utils;
public interface IResourceManager
{
    string GetStringFormatted(string locale, string key, params object[] args);
    string GetString(string locale, string key);
}
