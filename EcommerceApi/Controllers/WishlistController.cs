using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.Services;
using System.Security.Claims;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/wishlist
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Wishlist>>> GetWishlist()
    {
        var customerIdClaim = User.FindFirst("CustomerId");
        if (customerIdClaim == null)
        {
            return Unauthorized();
        }

        var customerId = int.Parse(customerIdClaim.Value);

        var wishlist = await _context.Wishlists
            .Include(w => w.Product)
                .ThenInclude(p => p.ProductImages)
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Where(w => w.Wishlist_CustomerId == customerId)
            .ToListAsync();

        foreach (var item in wishlist)
        {
            if (item.Product != null)
            {
                DiscountHelper.ApplyDiscountFields(item.Product);
            }
        }

        return Ok(wishlist);
    }

    // POST: api/wishlist
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Wishlist>> AddToWishlist([FromBody] WishlistRequest request)
    {
        var customerIdClaim = User.FindFirst("CustomerId");
        if (customerIdClaim == null)
        {
            return Unauthorized();
        }

        var customerId = int.Parse(customerIdClaim.Value);

        // Check if already exists
        var existing = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.Wishlist_CustomerId == customerId && w.Wishlist_ProductId == request.ProductId);

        if (existing != null)
        {
            return Ok(new { message = "Product already in wishlist" });
        }

        var wishlist = new Wishlist
        {
            Wishlist_CustomerId = customerId,
            Wishlist_ProductId = request.ProductId,
            Wishlist_CreatedAt = DateTime.UtcNow
        };

        _context.Wishlists.Add(wishlist);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Added to wishlist" });
    }

    // DELETE: api/wishlist/{productId}
    [Authorize]
    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(int productId)
    {
        var customerIdClaim = User.FindFirst("CustomerId");
        if (customerIdClaim == null)
        {
            return Unauthorized();
        }

        var customerId = int.Parse(customerIdClaim.Value);

        var wishlist = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.Wishlist_CustomerId == customerId && w.Wishlist_ProductId == productId);

        if (wishlist == null)
        {
            return NotFound();
        }

        _context.Wishlists.Remove(wishlist);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Removed from wishlist" });
    }
}

public class WishlistRequest
{
    public int ProductId { get; set; }
}