using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST: api/auth/login
[HttpPost("login")]
public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
{
    var admin = await _context.AdminUsers
        .FirstOrDefaultAsync(a => a.AdminUser_Username == request.Username);

    if (admin == null)
    {
        return Unauthorized(new { message = "Invalid username or password." });
    }

    // Verify password (V1: plain text comparison)
    if (request.Password != "admin123")
    {
        return Unauthorized(new { message = "Invalid username or password." });
    }

    // Generate JWT token
    var token = GenerateJwtToken(admin);

    return Ok(new
    {
        message = "Login successful",
        token = token,
        admin = new
        {
            admin.AdminUser_Id,
            admin.AdminUser_Username,
            admin.AdminUser_Email,
            admin.AdminUser_StoreName,
            admin.AdminUser_StorePhone,     // ← ADD THIS
            admin.AdminUser_StoreAddress,   // ← ADD THIS
            admin.AdminUser_StoreLogo       // ← ADD THIS
        }
    });
}
    // POST: api/auth/register (Create first admin - one time use)
    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] RegisterRequest request)
    {
        // Check if any admin already exists
        var anyAdmin = await _context.AdminUsers.AnyAsync();
        if (anyAdmin)
        {
            return BadRequest(new { message = "Admin already exists. Registration disabled." });
        }

        // Create new admin
        var admin = new AdminUser
        {
            AdminUser_Username = request.Username,
            AdminUser_PasswordHash = request.Password, // V1: plain text - will hash later
            AdminUser_Email = request.Email,
            AdminUser_StoreName = request.StoreName,
            AdminUser_StorePhone = request.StorePhone,
            AdminUser_StoreAddress = request.StoreAddress,
            AdminUser_IsActive = true,
            AdminUser_CreatedAt = DateTime.UtcNow,
            AdminUser_UpdatedAt = DateTime.UtcNow
        };

        _context.AdminUsers.Add(admin);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Admin account created successfully",
            admin = new
            {
                admin.AdminUser_Id,
                admin.AdminUser_Username,
                admin.AdminUser_Email,
                admin.AdminUser_StoreName
            }
        });
    }

    // Helper: Generate JWT token
    private string GenerateJwtToken(AdminUser admin)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"];
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, admin.AdminUser_Id.ToString()),
            new Claim(ClaimTypes.Name, admin.AdminUser_Username),
            new Claim(ClaimTypes.Email, admin.AdminUser_Email),
            new Claim("StoreName", admin.AdminUser_StoreName)
        };

        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials,
            claims: claims
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Request DTOs (Data Transfer Objects)
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
    public string StorePhone { get; set; } = string.Empty;
    public string? StoreAddress { get; set; }
}