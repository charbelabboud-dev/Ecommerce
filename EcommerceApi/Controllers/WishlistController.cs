using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;

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

    // GET: api/wishlist/{email}
    [HttpGet("{email}")]
    public async Task<ActionResult<IEnumerable<Wishlist>>> GetWishlist(string email)
    {
        var wishlist = await _context.Wishlists
            .Include(w => w.Product)
            .ThenInclude(p => p.ProductImages)
            .Where(w => w.Wishlist_CustomerEmail == email)
            .ToListAsync();

        return Ok(wishlist);
    }

    // POST: api/wishlist
    [HttpPost]
    public async Task<ActionResult<Wishlist>> AddToWishlist([FromBody] WishlistRequest request)
    {
        // Check if already exists
        var existing = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.Wishlist_CustomerEmail == request.Email && w.Wishlist_ProductId == request.ProductId);

        if (existing != null)
        {
            return Ok(new { message = "Product already in wishlist" });
        }

        var wishlist = new Wishlist
        {
            Wishlist_CustomerEmail = request.Email,
            Wishlist_ProductId = request.ProductId,
            Wishlist_CreatedAt = DateTime.UtcNow
        };

        _context.Wishlists.Add(wishlist);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Added to wishlist" });
    }

    // DELETE: api/wishlist/{email}/{productId}
    [HttpDelete("{email}/{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(string email, int productId)
    {
        var wishlist = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.Wishlist_CustomerEmail == email && w.Wishlist_ProductId == productId);

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
    public string Email { get; set; } = string.Empty;
    public int ProductId { get; set; }
}