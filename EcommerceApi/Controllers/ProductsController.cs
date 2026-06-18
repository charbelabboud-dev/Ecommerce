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
            .Include(p => p.ProductVariants.Where(v => v.ProductVariant_IsActive))
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
            .Include(p => p.ProductVariants.Where(v => v.ProductVariant_IsActive))
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
        .Where(p => p.Product_Stock > 0 && p.Product_Stock <= p.Product_LowStockThreshold)
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
        existingProduct.Product_LowStockThreshold = updatedProduct.Product_LowStockThreshold > 0
            ? updatedProduct.Product_LowStockThreshold
            : 5;

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

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-action")]
    public async Task<IActionResult> BulkAction([FromBody] DTOs.BulkProductActionDto dto)
    {
        if (dto.ProductIds == null || dto.ProductIds.Count == 0)
            return BadRequest(new { message = "No products selected." });

        var products = await _context.Products
            .Where(p => dto.ProductIds.Contains(p.Product_Id))
            .ToListAsync();

        if (products.Count == 0)
            return NotFound(new { message = "No matching products found." });

        foreach (var product in products)
        {
            switch (dto.Action?.ToLowerInvariant())
            {
                case "activate":
                    product.Product_IsActive = true;
                    break;
                case "deactivate":
                    product.Product_IsActive = false;
                    break;
                case "setdiscount":
                    product.Product_DiscountPercent = NormalizeDiscount(dto.DiscountPercent);
                    break;
                default:
                    return BadRequest(new { message = "Invalid action. Use: activate, deactivate, setDiscount." });
            }
            product.Product_UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{products.Count} product(s) updated.", count = products.Count });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .OrderBy(p => p.Product_Name)
            .ToListAsync();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("Id,Name,SKU,Category,PriceUSD,PriceLBP,Stock,LowStockThreshold,DiscountPercent,Active,Featured");

        foreach (var p in products)
        {
            var category = p.Category?.Category_Name ?? "";
            sb.AppendLine($"{p.Product_Id},\"{EscapeCsv(p.Product_Name)}\",\"{EscapeCsv(p.Product_SKU)}\",\"{EscapeCsv(category)}\",{p.Product_PriceUSD},{p.Product_PriceLBP},{p.Product_Stock},{p.Product_LowStockThreshold},{p.Product_DiscountPercent},{p.Product_IsActive},{p.Product_IsFeatured}");
        }

        return File(System.Text.Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"products-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{productId}/variants")]
    public async Task<ActionResult<IEnumerable<ProductVariant>>> GetVariants(int productId)
    {
        return Ok(await _context.ProductVariants
            .Where(v => v.ProductVariant_ProductId == productId)
            .ToListAsync());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{productId}/variants")]
    public async Task<ActionResult<ProductVariant>> CreateVariant(int productId, ProductVariant variant)
    {
        if (!await _context.Products.AnyAsync(p => p.Product_Id == productId))
            return NotFound();

        variant.ProductVariant_ProductId = productId;
        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();
        return Ok(variant);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("variants/{variantId}")]
    public async Task<IActionResult> UpdateVariant(int variantId, ProductVariant updated)
    {
        var variant = await _context.ProductVariants.FindAsync(variantId);
        if (variant == null) return NotFound();

        variant.ProductVariant_Size = updated.ProductVariant_Size;
        variant.ProductVariant_Color = updated.ProductVariant_Color;
        variant.ProductVariant_Stock = updated.ProductVariant_Stock;
        variant.ProductVariant_SKU = updated.ProductVariant_SKU;
        variant.ProductVariant_PriceAdjustmentUSD = updated.ProductVariant_PriceAdjustmentUSD;
        variant.ProductVariant_PriceAdjustmentLBP = updated.ProductVariant_PriceAdjustmentLBP;
        variant.ProductVariant_IsActive = updated.ProductVariant_IsActive;

        await _context.SaveChangesAsync();
        return Ok(variant);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("variants/{variantId}")]
    public async Task<IActionResult> DeleteVariant(int variantId)
    {
        var variant = await _context.ProductVariants.FindAsync(variantId);
        if (variant == null) return NotFound();

        _context.ProductVariants.Remove(variant);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Variant deleted" });
    }

    private static string EscapeCsv(string? value) =>
        (value ?? "").Replace("\"", "\"\"");
}