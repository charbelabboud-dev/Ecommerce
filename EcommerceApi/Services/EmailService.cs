using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;

namespace EcommerceApi.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    public EmailService(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var smtpServer = emailSettings["SmtpServer"]?.Trim()
            ?? throw new InvalidOperationException("EmailSettings:SmtpServer is not configured.");
        var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
        var senderEmail = emailSettings["SenderEmail"]?.Trim();
        var senderPassword = emailSettings["SenderPassword"]?.Trim().Replace(" ", "");

        if (string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(senderPassword))
        {
            throw new InvalidOperationException(
                "Email is not configured. Set EmailSettings:SenderEmail and EmailSettings:SenderPassword via environment variables or user secrets.");
        }

        var storeName = await GetStoreNameAsync();

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(storeName, senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(senderEmail, senderPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    public bool IsConfigured()
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        return !string.IsNullOrWhiteSpace(emailSettings["SenderEmail"])
            && !string.IsNullOrWhiteSpace(emailSettings["SenderPassword"]);
    }

    private async Task<string> GetStoreNameAsync()
    {
        var admin = await _context.AdminUsers.AsNoTracking().FirstOrDefaultAsync();
        return string.IsNullOrWhiteSpace(admin?.AdminUser_StoreName)
            ? "Store"
            : admin.AdminUser_StoreName;
    }
}
