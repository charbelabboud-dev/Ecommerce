using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.DTOs;
using EcommerceApi.Models;
using EcommerceApi.Services;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartItemResponseDto>>> GetCart()
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        var items = await _context.CartItems
            .Where(c => c.CartItem_CustomerId == customerId.Value)
            .Include(c => c.Product!)
                .ThenInclude(p => p!.ProductImages)
            .Include(c => c.Product!)
                .ThenInclude(p => p!.Category)
            .Include(c => c.Variant)
            .ToListAsync();

        var products = items.Where(i => i.Product != null).Select(i => i.Product!).ToList();
        DiscountHelper.ApplyDiscountFields(products);

        return Ok(items.Select(MapToResponse));
    }

    [HttpPut("sync")]
    public async Task<ActionResult<IEnumerable<CartItemResponseDto>>> SyncCart([FromBody] SyncCartDto dto)
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        var existing = await _context.CartItems
            .Where(c => c.CartItem_CustomerId == customerId.Value)
            .ToListAsync();

        _context.CartItems.RemoveRange(existing);

        foreach (var item in dto.Items.Where(i => i.Quantity > 0))
        {
            var productExists = await _context.Products.AnyAsync(p => p.Product_Id == item.ProductId && p.Product_IsActive);
            if (!productExists) continue;

            if (item.VariantId.HasValue)
            {
                var variantValid = await _context.ProductVariants.AnyAsync(v =>
                    v.ProductVariant_Id == item.VariantId &&
                    v.ProductVariant_ProductId == item.ProductId &&
                    v.ProductVariant_IsActive);
                if (!variantValid) continue;
            }

            _context.CartItems.Add(new CartItem
            {
                CartItem_CustomerId = customerId.Value,
                CartItem_ProductId = item.ProductId,
                CartItem_VariantId = item.VariantId,
                CartItem_Quantity = item.Quantity,
                CartItem_UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return await GetCart();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Unauthorized();

        var items = await _context.CartItems
            .Where(c => c.CartItem_CustomerId == customerId.Value)
            .ToListAsync();

        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cart cleared" });
    }

    private int? GetCustomerId()
    {
        var claim = User.FindFirst("CustomerId");
        return claim != null ? int.Parse(claim.Value) : null;
    }

    private static CartItemResponseDto MapToResponse(CartItem item) => new()
    {
        CartItem_Id = item.CartItem_Id,
        CartItem_ProductId = item.CartItem_ProductId,
        CartItem_VariantId = item.CartItem_VariantId,
        CartItem_Quantity = item.CartItem_Quantity,
        Product = item.Product,
        Variant = item.Variant
    };
}
