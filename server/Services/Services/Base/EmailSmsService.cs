using System.Net;
using System.Net.Mail;
using Model.Models;
using Serilog;
using Service.Interfaces.Base;

namespace Service.Services.System;

public class EmailSmsService : IEmailSmsService
{
    private readonly AppSettings _appSettings;

    public EmailSmsService(
        AppSettings appSettings
    )
    {
        _appSettings = appSettings;
    }

    public async Task SendSMTPEmailAsync(EmailMessage emailMessage)
    {
        try
        {
            var emailSettings = _appSettings.EmailConfiguration.SMTP;

            using var client = new SmtpClient(emailSettings.Host, emailSettings.Port)
            {
                EnableSsl = emailSettings.EnableSsl,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(emailSettings.UserName, emailSettings.Password)
            };

            var from = new MailAddress(emailSettings.FromEmail, emailSettings.FromName);
            var toAddress = new MailAddress(emailMessage.ToEmail);

            using var message = new MailMessage(from, toAddress)
            {
                Subject = emailMessage.Subject,
                Body = emailMessage.Body,
                IsBodyHtml = emailMessage.IsHtml
            };

            await client.SendMailAsync(message);
            Log.Information($"Email sent successfully to {emailMessage.ToEmail} with subject {emailMessage.Subject}");
        }
        catch (Exception ex)
        {
            Log.Error(ex, $"Failed to send email to {emailMessage.ToEmail}");
        }
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        try
        {
            using var httpClient = new HttpClient();
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "to", phoneNumber },
                { "message", message },
                { "apikey", "your-api-key" }
            });

            var response = await httpClient.PostAsync("https://sms.gateway.example/send", content);
            response.EnsureSuccessStatusCode();
            Log.Information($"Sms sent successfully to {phoneNumber}");
        }
        catch (Exception ex)
        {
            Log.Error(ex, $"Failed to send sms to {phoneNumber}");
        }
    }

    public async Task<string> GetEmailTemplate(string templateName)
    {
        try
        {
            var templatePath = Path.Combine("Resources", "Templates", "Email", templateName);
            var body = await File.ReadAllTextAsync(templatePath);
            return body;
        }
        catch (Exception ex)
        {
            Log.Error(ex, $"Failed to get email template {templateName}");
            return string.Empty;
        }
    }
}