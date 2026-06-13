using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using EcommerceApi.Data;
using EcommerceApi.DTOs;
using EcommerceApi.Services;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailService _emailService;

    public ContactController(AppDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<object>> SendMessage([FromBody] ContactRequest request)
    {
        if (!_emailService.IsConfigured())
        {
            return StatusCode(503, new { message = "Contact form is temporarily unavailable. Please call or email us directly." });
        }

        var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.AdminUser_IsActive);
        if (admin == null || string.IsNullOrWhiteSpace(admin.AdminUser_Email))
        {
            return StatusCode(503, new { message = "Store contact is not configured." });
        }

        var storeName = admin.AdminUser_StoreName ?? "Store";
        var subject = string.IsNullOrWhiteSpace(request.Subject)
            ? $"Contact form — {request.Name}"
            : $"[{storeName}] {request.Subject}";

        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif; color: #0f172a;'>
                <h2 style='color: #0c1f3d;'>New contact message</h2>
                <p><strong>From:</strong> {request.Name} &lt;{request.Email}&gt;</p>
                <p><strong>Subject:</strong> {request.Subject ?? "(none)"}</p>
                <hr style='border: none; border-top: 1px solid #e2e8f0;' />
                <p style='white-space: pre-wrap;'>{System.Net.WebUtility.HtmlEncode(request.Message)}</p>
            </body>
            </html>";

        await _emailService.SendEmailAsync(admin.AdminUser_Email, subject, body);

        return Ok(new { message = "Thank you for your message. We'll get back to you soon." });
    }
}
