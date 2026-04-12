using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims;

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
            // .Where(p => p.Product_IsActive == true)
            .Include(p => p.ProductImages)
            .OrderBy(p => p.Product_Name)
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Product_Id == id);

        if (product == null)
        {
            return NotFound($"Product with ID {id} not found.");
        }

        return Ok(product);
    }

    // POST: api/products
    [Authorize]
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

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetProduct), new { id = product.Product_Id }, product);
}

    // PUT: api/products/5
    [Authorize]
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

        await _context.SaveChangesAsync();

        return Ok(existingProduct);
    }

    // DELETE: api/products/5
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        
        if (product == null)
        {
            return NotFound($"Product with ID {id} not found.");
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok($"Product with ID {id} has been deleted.");
    }
    
}