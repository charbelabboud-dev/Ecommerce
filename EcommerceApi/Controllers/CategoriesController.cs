using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/categories (Public)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.Category_IsActive == true)
            .OrderBy(c => c.Category_DisplayOrder)
            .ThenBy(c => c.Category_Name)
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/categories/all (Admin only - includes inactive)
    [Authorize]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.Category_DisplayOrder)
            .ThenBy(c => c.Category_Name)
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return NotFound($"Category with ID {id} not found.");
        }

        return Ok(category);
    }

    // GET: api/categories/slug/food
    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<Category>> GetCategoryBySlug(string slug)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Category_Slug == slug);

        if (category == null)
        {
            return NotFound($"Category with slug '{slug}' not found.");
        }

        return Ok(category);
    }

    // GET: api/categories/5/products
    [HttpGet("{id}/products")]
    public async Task<ActionResult<IEnumerable<Product>>> GetCategoryProducts(int id)
    {
        var products = await _context.Products
            .Where(p => p.Product_CategoryId == id && p.Product_IsActive == true)
            .Include(p => p.ProductImages)
            .OrderBy(p => p.Product_Name)
            .ToListAsync();

        return Ok(products);
    }

    // POST: api/categories (Admin only)
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        // Generate slug from name
        category.Category_Slug = GenerateSlug(category.Category_Name);
        category.Category_CreatedAt = DateTime.UtcNow;
        category.Category_UpdatedAt = DateTime.UtcNow;

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Category_Id }, category);
    }

    // PUT: api/categories/5 (Admin only)
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, Category updatedCategory)
    {
        if (id != updatedCategory.Category_Id)
        {
            return BadRequest("ID mismatch.");
        }

        var existingCategory = await _context.Categories.FindAsync(id);
        
        if (existingCategory == null)
        {
            return NotFound($"Category with ID {id} not found.");
        }

        existingCategory.Category_Name = updatedCategory.Category_Name;
        existingCategory.Category_Slug = GenerateSlug(updatedCategory.Category_Name);
        existingCategory.Category_Description = updatedCategory.Category_Description;
        existingCategory.Category_ImageUrl = updatedCategory.Category_ImageUrl;
        existingCategory.Category_DisplayOrder = updatedCategory.Category_DisplayOrder;
        existingCategory.Category_IsActive = updatedCategory.Category_IsActive;
        existingCategory.Category_UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(existingCategory);
    }

    // DELETE: api/categories/5 (Admin only)
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        
        if (category == null)
        {
            return NotFound($"Category with ID {id} not found.");
        }

        // Check if category has products
        var hasProducts = await _context.Products.AnyAsync(p => p.Product_CategoryId == id);
        if (hasProducts)
        {
            return BadRequest("Cannot delete category that has products. Remove products first or reassign them.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok($"Category with ID {id} has been deleted.");
    }

    private string GenerateSlug(string name)
    {
        // Convert to lowercase and replace spaces with hyphens
        var slug = name.ToLower().Trim().Replace(" ", "-");
        // Remove special characters
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        return slug;
    }
}