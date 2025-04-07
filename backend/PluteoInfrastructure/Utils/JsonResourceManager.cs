using Newtonsoft.Json;
using Pluteo.Domain.Interfaces;

namespace Pluteo.Infrastructure.Utils;
public class JsonResourceManager(string filePath) : IResourceManager
{

    private readonly Dictionary<string, string> _resources = LoadResources(filePath) ?? [];

    private static Dictionary<string,string>? LoadResources(string filePath)
    {
        if (File.Exists(filePath))
        {
            var json = File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        }
        else
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }
    }

    public string GetString(string key)
    {
        if (_resources.TryGetValue(key, out string? value))
        {
            return value;
        }

        return $"[{key}]";
    }
}