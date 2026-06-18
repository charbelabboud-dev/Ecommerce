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

        // GET: api/categories (Public - top-level with subcategories)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.Category_IsActive == true && c.Category_ParentId == null)
                .Include(c => c.Subcategories.Where(s => s.Category_IsActive))
                .OrderBy(c => c.Category_DisplayOrder)
                .ThenBy(c => c.Category_Name)
                .ToListAsync();

            return Ok(categories.Select(c => new
            {
                c.Category_Id,
                c.Category_Name,
                c.Category_Slug,
                c.Category_Description,
                c.Category_ImageUrl,
                c.Category_DisplayOrder,
                c.Category_IsActive,
                c.Category_DiscountPercent,
                c.Category_ParentId,
                Subcategories = c.Subcategories.OrderBy(s => s.Category_DisplayOrder).Select(s => new
                {
                    s.Category_Id,
                    s.Category_Name,
                    s.Category_Slug,
                    s.Category_Description,
                    s.Category_DisplayOrder,
                    s.Category_DiscountPercent,
                    s.Category_ParentId
                })
            }));
        }

        // GET: api/categories/tree (Admin - full hierarchy)
        [Authorize(Roles = "Admin")]
        [HttpGet("tree")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategoryTree()
        {
            return Ok(await _context.Categories
                .Include(c => c.Subcategories)
                .Where(c => c.Category_ParentId == null)
                .OrderBy(c => c.Category_DisplayOrder)
                .ToListAsync());
        }

        // GET: api/categories/all (Admin only - includes inactive)
        [Authorize (Roles = "Admin")]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Parent)
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
                .Include(p => p.ProductVariants.Where(v => v.ProductVariant_IsActive))
                .OrderBy(p => p.Product_Name)
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/categories (Admin only)
        [Authorize (Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            // Generate slug from name
            category.Category_Slug = GenerateSlug(category.Category_Name);
            category.Category_DiscountPercent = NormalizeDiscount(category.Category_DiscountPercent);
            category.Category_ParentId = category.Category_ParentId;
            category.Category_CreatedAt = DateTime.UtcNow;
            category.Category_UpdatedAt = DateTime.UtcNow;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Category_Id }, category);
        }

        // PUT: api/categories/5 (Admin only)
        [Authorize (Roles = "Admin")]
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
            existingCategory.Category_DiscountPercent = NormalizeDiscount(updatedCategory.Category_DiscountPercent);
            existingCategory.Category_ParentId = updatedCategory.Category_ParentId;
            existingCategory.Category_UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existingCategory);
        }

        // DELETE: api/categories/5 (Admin only)
        [Authorize (Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }

            // Check if category has products or subcategories
            var hasProducts = await _context.Products.AnyAsync(p => p.Product_CategoryId == id);
            var hasSubcategories = await _context.Categories.AnyAsync(c => c.Category_ParentId == id);
            if (hasProducts)
            {
                return BadRequest("Cannot delete category that has products. Remove products first or reassign them.");
            }
            if (hasSubcategories)
            {
                return BadRequest("Cannot delete category that has subcategories. Remove subcategories first.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok($"Category with ID {id} has been deleted.");
        }

        private static decimal? NormalizeDiscount(decimal? discount)
        {
            if (!discount.HasValue || discount <= 0)
            {
                return null;
            }

            return Math.Min(100, Math.Max(0, discount.Value));
        }

        private string GenerateSlug(string name)
        {
            var slug = name.ToLower().Trim().Replace(" ", "-");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
            return slug;
        }
    }