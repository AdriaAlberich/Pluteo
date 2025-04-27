using Newtonsoft.Json;
using Pluteo.Domain.Interfaces.Utils;
using Pluteo.Domain.Static;
using ILogger = Serilog.ILogger;

namespace Pluteo.Infrastructure.Utils;
public class JsonResourceManager : IResourceManager
{
    private readonly ILogger _logger;
    private readonly Dictionary<string, Dictionary<string, string>> _resources;

    public JsonResourceManager(ILogger logger)
    {
        _logger = logger;
        _resources = LoadResources() ?? [];
    }

    private Dictionary<string, Dictionary<string, string>> LoadResources()
    {
        Dictionary<string, Dictionary<string,string>> resources = [];
        foreach (var locale in Localizations.Locales)
        {
            var filePath = Path.Combine("Resources", $"locale_{locale}.json");
            if (File.Exists(filePath))
            {
                var json = File.ReadAllText(filePath);
                resources.Add(locale, JsonConvert.DeserializeObject<Dictionary<string, string>>(json) ?? []);
            }
            else
            {
                _logger.Error("Resource file '{FilePath}' not found.", filePath);
            }
        }

        return resources;
    }

    public string GetStringFormatted(string locale, string key, params object[] args)
    {
        if (args.Length > 0)
        {
            return string.Format(GetString(locale, key), args);
        }

        return GetString(locale, key);
    }

    public string GetString(string locale, string key)
    {
        if (_resources[locale].TryGetValue(key, out string? value))
        {
            return value;
        }

        return $"[{key}]";
    }
}