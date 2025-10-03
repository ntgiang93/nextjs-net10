using System.Threading.Tasks;

namespace Service.Interfaces.Base
{
    public interface IEmailSmsService
    {
        Task SendSMTPEmailAsync(EmailMessage message);
        Task SendSmsAsync(string phoneNumber, string message);
        Task<string> GetEmailTemplate(string templateName);
    }
}