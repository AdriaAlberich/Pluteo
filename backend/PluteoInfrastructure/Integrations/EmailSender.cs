using Pluteo.Domain.Exceptions;
using Pluteo.Domain.Interfaces.Integrations;
using Pluteo.Domain.Models.Settings;
using RestSharp;
using RestSharp.Authenticators;

namespace Pluteo.Infrastructure.Integrations;
public class EmailSender(EmailSettings emailSettings) : IEmailSender
{

    private readonly string _templatesDir = emailSettings.EmailTemplatesDir;

    private readonly string _baseUri = emailSettings.EmailBaseUri;

    private readonly string _apiKey = emailSettings.EmailAPIKey;

    private readonly string _domain = emailSettings.EmailDomain;

    private readonly string _fromName = emailSettings.EmailFromName;

    private readonly string _fromEmail = emailSettings.EmailFromEmail;

    /// <summary>
    /// Sends an email using the specified subject, template, recipient and dynamic fields.
    /// </summary>
    /// <param name="subject"></param>
    /// <param name="template"></param>
    /// <param name="recipient"></param>
    /// <param name="dynamicFields"></param>
    /// <returns></returns>
    /// <exception cref="EmailException"></exception>
    public async Task SendEmail(string subject, string template, string recipient, Dictionary<string,string>? dynamicFields = null)
    {
        string templateContent = await LoadTemplate(template);

        if(string.IsNullOrWhiteSpace(templateContent)) 
            throw new EmailException("Error while loading the template");

        if(dynamicFields != null)
            templateContent = await ProcessTemplate(templateContent, dynamicFields);

        await Send(subject, recipient, templateContent);
    }

    /// <summary>
    /// Sends an email using the specified subject, recipient and template content.
    /// </summary>
    /// <param name="subject"></param>
    /// <param name="recipient"></param>
    /// <param name="templateContent"></param>
    /// <returns></returns>
    private async Task Send(string subject, string recipient, string templateContent)
    {
        RestClientOptions options = new(_baseUri)
        {
            Authenticator = new HttpBasicAuthenticator("api", _apiKey)
        };

        RestClient client = new(options);

        RestRequest request = new();
        request.AddParameter("domain", _domain, ParameterType.UrlSegment);
        request.Resource = "{domain}/messages";
        request.AddParameter("from", $"{_fromName} <{_fromEmail}>");
        request.AddParameter("to", recipient);
        request.AddParameter("subject", subject);
        request.AddParameter("html", templateContent);
        request.Method = Method.Post;
        
        await client.ExecuteAsync(request);
    }

    /// <summary>
    /// Loads the email template from the specified directory.
    /// </summary>
    /// <param name="template"></param>
    /// <returns></returns>
    /// <exception cref="EmailException"></exception>
    private async Task<string> LoadTemplate(string template) 
    {
        string templateContent = string.Empty;
        try
        {
            string templatePath = $"{_templatesDir}/{template}.html";

            if (File.Exists(templatePath))
            {
                templateContent = await File.ReadAllTextAsync(templatePath);
            }
        }
        catch (Exception e)
        {
            throw new EmailException(e.Message);
        }

        return templateContent;
    }

    /// <summary>
    /// Processes the template content by replacing dynamic fields with their values.
    /// </summary>
    /// <param name="templateContent"></param>
    /// <param name="dynamicFields"></param>
    /// <returns></returns>
    private static async Task<string> ProcessTemplate(string templateContent, Dictionary<string,string> dynamicFields)
    {
        await Task.Run(() => {
            foreach(KeyValuePair<string,string> field in dynamicFields)
            {
                templateContent = templateContent.Replace($"%{field.Key}%", field.Value);
            }
        });

        return templateContent;
    }
}
