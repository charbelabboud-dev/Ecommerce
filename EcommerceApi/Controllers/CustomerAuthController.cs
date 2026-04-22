using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EcommerceApi.Data;
using EcommerceApi.Models;
using System.Net.Mail;
using System.Net;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public CustomerAuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST: api/customerauth/register
    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] CustomerRegisterRequest request)
    {
        // Check if email already exists
        var existingCustomer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (existingCustomer != null)
        {
            return BadRequest(new { message = "Email already registered." });
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create customer
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

        // Generate and send OTP
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

        // Send email with OTP
        await SendOtpEmail(request.Email, otpCode);

        return Ok(new { 
            message = "Registration successful. Please verify your email with the OTP sent.",
            email = request.Email
        });
    }

    // POST: api/customerauth/verify-otp
    [HttpPost("verify-otp")]
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

        // Mark OTP as used
        otp.Otp_IsUsed = true;
        await _context.SaveChangesAsync();

        // Update customer as verified
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

        if (customer != null)
        {
            customer.IsEmailConfirmed = true;
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Email verified successfully. You can now login." });
    }

    // POST: api/customerauth/resend-otp
    [HttpPost("resend-otp")]
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

        // Generate new OTP
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

        // Send email with OTP
        await SendOtpEmail(request.Email, otpCode);

        return Ok(new { message = "New OTP sent to your email." });
    }

    // POST: api/customerauth/login
    [HttpPost("login")]
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
            return Unauthorized(new { message = "Please verify your email first." });
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, customer.Customer_PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        // Generate JWT token
        var token = GenerateJwtToken(customer);

        return Ok(new
        {
            message = "Login successful",
            token = token,
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

    // Helper: Generate 6-digit OTP
    private string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    // Helper: Send email with OTP
    private async Task SendOtpEmail(string email, string otpCode)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var smtpServer = emailSettings["SmtpServer"];
        var smtpPort = int.Parse(emailSettings["SmtpPort"]);
        var senderEmail = emailSettings["SenderEmail"];
        var senderPassword = emailSettings["SenderPassword"];
        var enableSsl = bool.Parse(emailSettings["EnableSsl"]);

        using var client = new SmtpClient(smtpServer, smtpPort);
        client.Credentials = new NetworkCredential(senderEmail, senderPassword);
        client.EnableSsl = enableSsl;

        var subject = "Verify Your Email - MyStore";
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #1e3a5f;'>Welcome to MyStore!</h2>
                <p>Thank you for registering. Please use the following OTP to verify your email:</p>
                <div style='background-color: #f0f2f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;'>
                    {otpCode}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style='font-size: 12px; color: #666;'>MyStore - Your trusted online store</p>
            </body>
            </html>
        ";

        var mailMessage = new MailMessage(senderEmail, email, subject, body);
        mailMessage.IsBodyHtml = true;

        await client.SendMailAsync(mailMessage);
    }

// POST: api/customerauth/auto-login-after-verify
[HttpPost("auto-login-after-verify")]
public async Task<ActionResult<object>> AutoLoginAfterVerify([FromBody] AutoLoginRequest request)
{
    var customer = await _context.Customers
        .FirstOrDefaultAsync(c => c.Customer_Email == request.Email);

    if (customer == null)
    {
        return NotFound(new { message = "Customer not found." });
    }

    if (!customer.IsEmailConfirmed)
    {
        return Unauthorized(new { message = "Email not verified." });
    }

    // Generate JWT token
    var token = GenerateJwtToken(customer);

    return Ok(new
    {
        message = "Auto-login successful",
        token = token,
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


    // Helper: Generate JWT token
    private string GenerateJwtToken(Customer customer)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"] ?? "LebanonEcommerceSecretKey2026ForJWT!!";
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Customer_Id.ToString()),
            new Claim(ClaimTypes.Name, customer.Customer_Name),
            new Claim(ClaimTypes.Email, customer.Customer_Email),
            new Claim("CustomerId", customer.Customer_Id.ToString())
        };

        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials,
            claims: claims
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Request DTOs
public class CustomerRegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
}

public class CustomerLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class ResendOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public class AutoLoginRequest
{
    public string Email { get; set; } = string.Empty;
}