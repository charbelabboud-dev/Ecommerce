using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.DTOs;
using Microsoft.AspNetCore.RateLimiting;

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

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<object>> Login([FromBody] AdminLoginRequest request)
    {
        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(a => a.AdminUser_Username == request.Username);

        if (admin == null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, admin.AdminUser_PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var token = GenerateJwtToken(admin);

        return Ok(new
        {
            message = "Login successful",
            token,
            admin = new
            {
                admin.AdminUser_Id,
                admin.AdminUser_Username,
                admin.AdminUser_Email,
                admin.AdminUser_StoreName,
                admin.AdminUser_StorePhone,
                admin.AdminUser_StoreAddress,
                admin.AdminUser_StoreLogo
            }
        });
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<object>> Register([FromBody] AdminRegisterRequest request)
    {
        var anyAdmin = await _context.AdminUsers.AnyAsync();
        if (anyAdmin)
        {
            return BadRequest(new { message = "Admin already exists. Registration disabled." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var admin = new AdminUser
        {
            AdminUser_Username = request.Username,
            AdminUser_PasswordHash = passwordHash,
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

    private string GenerateJwtToken(AdminUser admin)
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
            new Claim(ClaimTypes.NameIdentifier, admin.AdminUser_Id.ToString()),
            new Claim(ClaimTypes.Name, admin.AdminUser_Username),
            new Claim(ClaimTypes.Email, admin.AdminUser_Email),
            new Claim("StoreName", admin.AdminUser_StoreName),
            new Claim(ClaimTypes.Role, "Admin")
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
