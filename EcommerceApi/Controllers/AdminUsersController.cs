using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;
using System.Security.Claims;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/adminusers/settings
    [HttpGet("settings")]
    public async Task<ActionResult<object>> GetSettings()
    {
        var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (adminIdClaim == null)
        {
            return Unauthorized();
        }

        var adminId = int.Parse(adminIdClaim.Value);
        var admin = await _context.AdminUsers.FindAsync(adminId);

        if (admin == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            admin.AdminUser_Id,
            admin.AdminUser_Username,
            admin.AdminUser_StoreName,
            admin.AdminUser_StorePhone,
            admin.AdminUser_StoreAddress,
            admin.AdminUser_Email,
            admin.AdminUser_StoreLogo,
            admin.AdminUser_ShippingFeeUSD,
            admin.AdminUser_ShippingFeeLBP
        });
    }

    // PUT: api/adminusers/settings
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (adminIdClaim == null)
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var adminId = int.Parse(adminIdClaim.Value);
        var admin = await _context.AdminUsers.FindAsync(adminId);

        if (admin == null)
        {
            return NotFound(new { message = "Admin not found" });
        }

        // Update ALL fields
        admin.AdminUser_StoreName = request.StoreName ?? admin.AdminUser_StoreName;
        admin.AdminUser_StorePhone = request.StorePhone ?? admin.AdminUser_StorePhone;
        admin.AdminUser_StoreAddress = request.StoreAddress ?? admin.AdminUser_StoreAddress;
        admin.AdminUser_Email = request.Email ?? admin.AdminUser_Email;
        admin.AdminUser_StoreLogo = request.StoreLogo ?? admin.AdminUser_StoreLogo;
        admin.AdminUser_ShippingFeeUSD = request.ShippingFeeUSD ?? admin.AdminUser_ShippingFeeUSD;
        admin.AdminUser_ShippingFeeLBP = request.ShippingFeeLBP ?? admin.AdminUser_ShippingFeeLBP;
        admin.AdminUser_UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Settings updated successfully",
            storeName = admin.AdminUser_StoreName,
            storePhone = admin.AdminUser_StorePhone,
            storeAddress = admin.AdminUser_StoreAddress,
            email = admin.AdminUser_Email,
            storeLogo = admin.AdminUser_StoreLogo,
            shippingFeeUSD = admin.AdminUser_ShippingFeeUSD,
            shippingFeeLBP = admin.AdminUser_ShippingFeeLBP
        });
    }
}

public class UpdateSettingsRequest
{
    public string? StoreName { get; set; }
    public string? StorePhone { get; set; }
    public string? StoreAddress { get; set; }
    public string? Email { get; set; }
    public string? StoreLogo { get; set; }
    public decimal? ShippingFeeUSD { get; set; }
    public decimal? ShippingFeeLBP { get; set; }
}