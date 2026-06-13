using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.DTOs;
using EcommerceApi.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly EmailService _emailService;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<CustomerAuthController> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public CustomerAuthController(
        AppDbContext context,
        IConfiguration configuration,
        EmailService emailService,
        IHostEnvironment environment,
        ILogger<CustomerAuthController> logger,
        IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _environment = environment;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<object>> Register([FromBody] CustomerRegisterRequest request)
    {
        var existingCustomer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (existingCustomer != null)
        {
            if (existingCustomer.IsEmailConfirmed)
            {
                return BadRequest(new { message = "Email already registered. Please sign in instead." });
            }

            existingCustomer.Customer_Name = request.Name;
            existingCustomer.Customer_PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            existingCustomer.Customer_Phone = request.Phone;
            existingCustomer.Customer_Address = request.Address;
            existingCustomer.Customer_UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var resumeOtpDelivery = await IssueVerificationOtpAsync(request.Email);

            return Ok(new
            {
                message = resumeOtpDelivery.EmailSent
                    ? "Account not verified yet. A new verification code has been sent to your email."
                    : "Account updated, but the verification email could not be sent. Use Resend OTP on the verify page.",
                email = request.Email,
                requiresVerification = true,
                emailSent = resumeOtpDelivery.EmailSent
            });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var customer = new Customer
        {
            Customer_Name = request.Name,
            Customer_Email = request.Email,
            Customer_PasswordHash = passwordHash,
            Customer_Phone = request.Phone,
            Customer_Address = request.Address,
            IsEmailConfirmed = false,
            Customer_CreatedAt = DateTime.UtcNow,
            Customer_UpdatedAt = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var otpDelivery = await IssueVerificationOtpAsync(request.Email);

        return Ok(new
        {
            message = otpDelivery.EmailSent
                ? "Registration successful. Please verify your email with the OTP sent."
                : "Account created, but the verification email could not be sent. Use Resend OTP on the verify page.",
            email = request.Email,
            requiresVerification = true,
            emailSent = otpDelivery.EmailSent
        });
    }

    [HttpPost("verify-otp")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<object>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var otp = await _context.EmailVerificationOtps
            .FirstOrDefaultAsync(o => o.Otp_Email == request.Email && o.Otp_Code == request.OtpCode && !o.Otp_IsUsed);

        if (otp == null)
        {
            return BadRequest(new { message = "Invalid OTP." });
        }

        if (otp.Otp_ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "OTP has expired. Please request a new one." });
        }

        otp.Otp_IsUsed = true;
        await _context.SaveChangesAsync();

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (customer == null)
        {
            return BadRequest(new { message = "Customer account not found." });
        }

        customer.IsEmailConfirmed = true;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(customer);

        return Ok(new
        {
            message = "Email verified successfully.",
            token,
            customer = new
            {
                customer.Customer_Id,
                customer.Customer_Name,
                customer.Customer_Email,
                customer.Customer_Phone,
                customer.Customer_Address
            }
        });
    }

    [HttpPost("resend-otp")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<object>> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (customer == null)
        {
            return BadRequest(new { message = "Email not found." });
        }

        if (customer.IsEmailConfirmed)
        {
            return BadRequest(new { message = "Email already verified." });
        }

        var otpDelivery = await IssueVerificationOtpAsync(request.Email);

        return Ok(new
        {
            message = otpDelivery.EmailSent
                ? "New OTP sent to your email."
                : "Could not send email right now. If you're running locally, check the API terminal for the verification code.",
            emailSent = otpDelivery.EmailSent
        });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<object>> Login([FromBody] CustomerLoginRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (customer == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (!customer.IsEmailConfirmed)
        {
            return Unauthorized(new
            {
                message = "Please verify your email first.",
                requiresVerification = true,
                email = customer.Customer_Email
            });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, customer.Customer_PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = GenerateJwtToken(customer);

        return Ok(new
        {
            message = "Login successful",
            token,
            customer = new
            {
                customer.Customer_Id,
                customer.Customer_Name,
                customer.Customer_Email,
                customer.Customer_Phone,
                customer.Customer_Address
            }
        });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<object>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (customer == null)
        {
            return NotFound(new { message = "No account found with this email. Please check the address or create an account." });
        }

        if (!customer.IsEmailConfirmed)
        {
            return BadRequest(new { message = "Please verify your email before resetting your password." });
        }

        var otpCode = GenerateOtp();
        var otp = new EmailVerificationOtp
        {
            Otp_Email = request.Email,
            Otp_Code = otpCode,
            Otp_ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Otp_IsUsed = false,
            Otp_CreatedAt = DateTime.UtcNow
        };

        _context.EmailVerificationOtps.Add(otp);
        await _context.SaveChangesAsync();

        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #0c1f3d;'>Password Reset</h2>
                <p>Use this code to reset your password:</p>
                <div style='background-color: #f0f2f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;'>
                    {otpCode}
                </div>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>";

        try
        {
            await _emailService.SendEmailAsync(request.Email, "Reset Your Password", body);
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Unable to send the reset email right now. Please try again later or contact support."
            });
        }

        return Ok(new { message = "A reset code has been sent to your email." });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("otp")]
    public async Task<ActionResult<object>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var otp = await _context.EmailVerificationOtps
            .FirstOrDefaultAsync(o => o.Otp_Email == request.Email && o.Otp_Code == request.OtpCode && !o.Otp_IsUsed);

        if (otp == null)
        {
            return BadRequest(new { message = "Invalid reset code." });
        }

        if (otp.Otp_ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Reset code has expired. Please request a new one." });
        }

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email && c.IsEmailConfirmed);

        if (customer == null)
        {
            return BadRequest(new { message = "Account not found." });
        }

        otp.Otp_IsUsed = true;
        customer.Customer_PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        customer.Customer_UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You can now sign in." });
    }

    private static string GenerateOtp()
    {
        int otp = RandomNumberGenerator.GetInt32(100000, 1000000);
        return otp.ToString();
    }

    private sealed record OtpDeliveryResult(bool EmailSent);

    private async Task<OtpDeliveryResult> IssueVerificationOtpAsync(string email)
    {
        var otpCode = GenerateOtp();
        var otp = new EmailVerificationOtp
        {
            Otp_Email = email,
            Otp_Code = otpCode,
            Otp_ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Otp_IsUsed = false,
            Otp_CreatedAt = DateTime.UtcNow
        };

        _context.EmailVerificationOtps.Add(otp);
        await _context.SaveChangesAsync();

        if (_environment.IsDevelopment())
        {
            _logger.LogWarning(
                "DEV ONLY — Verification OTP for {Email}: {OtpCode} (expires in 10 minutes)",
                email,
                otpCode);
        }

        QueueVerificationEmail(email, otpCode);

        return new OtpDeliveryResult(EmailSent: true);
    }

    private void QueueVerificationEmail(string email, string otpCode)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
                await SendOtpEmailAsync(emailService, email, otpCode);
                _logger.LogInformation("Verification email sent to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Background verification email failed for {Email}", email);
            }
        });
    }

    private static async Task SendOtpEmailAsync(EmailService emailService, string email, string otpCode)
    {
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #0c1f3d;'>Welcome!</h2>
                <p>Please use the following OTP to verify your email:</p>
                <div style='background-color: #f0f2f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;'>
                    {otpCode}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>
        ";

        await emailService.SendEmailAsync(email, "Verify Your Email", body);
    }

    private string GenerateJwtToken(Customer customer)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"]
            ?? throw new InvalidOperationException("JWT Secret is missing from configuration.");
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "24");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Customer_Id.ToString()),
            new Claim(ClaimTypes.Name, customer.Customer_Name),
            new Claim(ClaimTypes.Email, customer.Customer_Email),
            new Claim("CustomerId", customer.Customer_Id.ToString()),
            new Claim(ClaimTypes.Role, "Customer")
        };

        var token = new JwtSecurityToken(
            issuer: string.IsNullOrEmpty(issuer) ? null : issuer,
            audience: string.IsNullOrEmpty(audience) ? null : audience,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials,
            claims: claims
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
