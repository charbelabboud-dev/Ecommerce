using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class StoreController : ControllerBase
{
    private readonly AppDbContext _context;

    public StoreController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/store/settings — public store info for storefront
    [HttpGet("settings")]
    public async Task<ActionResult<object>> GetPublicSettings()
    {
        var admin = await _context.AdminUsers.FirstOrDefaultAsync();

        if (admin == null)
        {
            return NotFound(new { message = "Store not configured" });
        }

        return Ok(new
        {
            storeName = admin.AdminUser_StoreName,
            storeLogo = admin.AdminUser_StoreLogo,
            storePhone = admin.AdminUser_StorePhone,
            storeAddress = admin.AdminUser_StoreAddress
        });
    }
}
