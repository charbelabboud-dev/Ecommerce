using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.Services;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims;
using Npgsql;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.ProductImages)
            .Include(p => p.Category)
            .OrderBy(p => p.Product_Name)
            .ToListAsync();

        DiscountHelper.ApplyDiscountFields(products);
        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.ProductImages)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Product_Id == id);

        if (product == null)
        {
            return NotFound($"Product with ID {id} not found.");
        }

        DiscountHelper.ApplyDiscountFields(product);
        return Ok(product);
    }

    // POST: api/products
    [Authorize (Roles = "Admin")]
[HttpPost]
public async Task<ActionResult<Product>> CreateProduct(Product product)
{
    // Get admin ID from the JWT token
    var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (adminIdClaim == null)
    {
        return Unauthorized("Invalid token.");
    }
    
    product.Product_AdminUserId = int.Parse(adminIdClaim.Value);
    product.Product_CreatedAt = DateTime.UtcNow;
    product.Product_UpdatedAt = DateTime.UtcNow;
    product.Product_DiscountPercent = NormalizeDiscount(product.Product_DiscountPercent);

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetProduct), new { id = product.Product_Id }, product);
}

// GET: api/products/low-stock
[Authorize(Roles = "Admin")]
[HttpGet("low-stock")]
public async Task<ActionResult<IEnumerable<Product>>> GetLowStockProducts()
{
    var lowStockProducts = await _context.Products
        .Where(p => p.Product_Stock <= 5 && p.Product_Stock > 0)
        .Include(p => p.Category)
        .OrderBy(p => p.Product_Stock)
        .ToListAsync();

    return Ok(lowStockProducts);
}
// PATCH: api/products/{id}/stock
[Authorize (Roles = "Admin")]
[HttpPatch("{id}/stock")]
public async Task<IActionResult> UpdateStock(int id, [FromBody] int newStock)
{
    var product = await _context.Products.FindAsync(id);
    if (product == null)
    {
        return NotFound($"Product with ID {id} not found.");
    }
    
    product.Product_Stock = newStock;
    product.Product_UpdatedAt = DateTime.UtcNow;
    
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "Stock updated successfully", stock = product.Product_Stock });
}
    // PUT: api/products/5
    [Authorize (Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product updatedProduct)
    {
        if (id != updatedProduct.Product_Id)
        {
            return BadRequest("ID mismatch.");
        }

        var existingProduct = await _context.Products.FindAsync(id);
        
        if (existingProduct == null)
        {
            return NotFound($"Product with ID {id} not found.");
        }

        // Update only allowed fields
        existingProduct.Product_Name = updatedProduct.Product_Name;
        existingProduct.Product_Description = updatedProduct.Product_Description;
        existingProduct.Product_ShortDescription = updatedProduct.Product_ShortDescription;
        existingProduct.Product_PriceUSD = updatedProduct.Product_PriceUSD;
        existingProduct.Product_PriceLBP = updatedProduct.Product_PriceLBP;
        existingProduct.Product_CompareAtPriceUSD = updatedProduct.Product_CompareAtPriceUSD;
        existingProduct.Product_CompareAtPriceLBP = updatedProduct.Product_CompareAtPriceLBP;
        existingProduct.Product_Stock = updatedProduct.Product_Stock;
        existingProduct.Product_SKU = updatedProduct.Product_SKU;
        existingProduct.Product_IsActive = updatedProduct.Product_IsActive;
        existingProduct.Product_IsFeatured = updatedProduct.Product_IsFeatured;
        existingProduct.Product_UpdatedAt = DateTime.UtcNow;
        existingProduct.Product_CategoryId = updatedProduct.Product_CategoryId;
        existingProduct.Product_ShippingFee = updatedProduct.Product_ShippingFee;
        existingProduct.Product_DiscountPercent = NormalizeDiscount(updatedProduct.Product_DiscountPercent);

        await _context.SaveChangesAsync();

        await _context.Entry(existingProduct).Reference(p => p.Category).LoadAsync();
        DiscountHelper.ApplyDiscountFields(existingProduct);
        return Ok(existingProduct);
    }

    // DELETE: api/products/5
[Authorize (Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProduct(int id)
{
    var product = await _context.Products.FindAsync(id);
    if (product == null)
    {
        return NotFound($"Product with ID {id} not found.");
    }

    try
    {
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok($"Product with ID {id} has been deleted.");
    }
    catch (DbUpdateException ex)
    {
        if (ex.InnerException is PostgresException pgEx && pgEx.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return BadRequest(new
            {
                message = "Cannot delete this product because it is referenced in existing orders. " +
                          "Mark it as 'Inactive' instead to hide it from the storefront."
            });
        }
        throw;
    }
}

    private static decimal? NormalizeDiscount(decimal? discount)
    {
        if (!discount.HasValue || discount <= 0)
        {
            return null;
        }

        return Math.Min(100, Math.Max(0, discount.Value));
    }
}