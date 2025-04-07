namespace Pluteo.Domain.Interfaces;
public interface IResourceManager
{
    string GetStringFormatted(string locale, string key, params object[] args);
    string GetString(string locale, string key);
}
