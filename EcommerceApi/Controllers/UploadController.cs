using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public UploadController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // POST: api/upload/product-image
    [Authorize (Roles = "Admin")]
    [HttpPost("product-image")]
    public async Task<ActionResult<ProductImage>> UploadProductImage([FromForm] UploadImageRequest request)
    {
        try
        {
            // Check if product exists
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound($"Product with ID {request.ProductId} not found.");
            }

            // Validate file
            if (request.Image == null || request.Image.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            // Check file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var fileExtension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest($"Invalid file type. Allowed: {string.Join(", ", allowedExtensions)}");
            }

            // Check file size (max 5MB)
            if (request.Image.Length > 5 * 1024 * 1024)
            {
                return BadRequest("File size exceeds 5MB limit.");
            }

            // Generate unique filename
            var uniqueFileName = $"{request.ProductId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            
            // Create directory if not exists
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "products");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Save file to disk
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(stream);
            }

            // Create image URL
            var imageUrl = $"/uploads/products/{uniqueFileName}";

            // If this image is set as main, remove IsMain from other images
            if (request.IsMain)
            {
                var existingMainImages = await _context.ProductImages
                    .Where(pi => pi.ProductImage_ProductId == request.ProductId && pi.ProductImage_IsMain == true)
                    .ToListAsync();
                
                foreach (var existingMain in existingMainImages)
                {
                    existingMain.ProductImage_IsMain = false;
                }
            }

            // Get next display order
            var maxOrder = await _context.ProductImages
                .Where(pi => pi.ProductImage_ProductId == request.ProductId)
                .MaxAsync(pi => (int?)pi.ProductImage_DisplayOrder) ?? 0;

            // Create image record
            var productImage = new ProductImage
            {
                ProductImage_ProductId = request.ProductId,
                ProductImage_ImageUrl = imageUrl,
                ProductImage_IsMain = request.IsMain,
                ProductImage_DisplayOrder = maxOrder + 1,
                ProductImage_CreatedAt = DateTime.UtcNow
            };

            _context.ProductImages.Add(productImage);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Image uploaded successfully",
                image = productImage
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Upload error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // DELETE: api/upload/delete-image/{id}
    [Authorize (Roles = "Admin")]
    [HttpDelete("delete-image/{id}")]
    public async Task<IActionResult> DeleteProductImage(int id)
    {
        var productImage = await _context.ProductImages.FindAsync(id);
        
        if (productImage == null)
        {
            return NotFound($"Image with ID {id} not found.");
        }

        var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var imagePath = Path.Combine(webRootPath, productImage.ProductImage_ImageUrl.TrimStart('/'));
        
        if (System.IO.File.Exists(imagePath))
        {
            System.IO.File.Delete(imagePath);
        }

        _context.ProductImages.Remove(productImage);
        await _context.SaveChangesAsync();

        if (productImage.ProductImage_IsMain == true)
        {
            var nextImage = await _context.ProductImages
                .Where(pi => pi.ProductImage_ProductId == productImage.ProductImage_ProductId)
                .OrderBy(pi => pi.ProductImage_DisplayOrder)
                .FirstOrDefaultAsync();

            if (nextImage != null)
            {
                nextImage.ProductImage_IsMain = true;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { message = "Image deleted successfully" });
    }

    // PUT: api/upload/set-main-image/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("set-main-image/{id}")]
    public async Task<IActionResult> SetMainImage(int id)
    {
        var image = await _context.ProductImages.FindAsync(id);
        if (image == null)
        {
            return NotFound($"Image with ID {id} not found.");
        }

        var productImages = await _context.ProductImages
            .Where(pi => pi.ProductImage_ProductId == image.ProductImage_ProductId)
            .ToListAsync();

        foreach (var productImage in productImages)
        {
            productImage.ProductImage_IsMain = productImage.ProductImage_Id == id;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Main image updated" });
    }

    // GET: api/upload/product-images/{productId}
    [HttpGet("product-images/{productId}")]
    public async Task<ActionResult<IEnumerable<ProductImage>>> GetProductImages(int productId)
    {
        var images = await _context.ProductImages
            .Where(pi => pi.ProductImage_ProductId == productId)
            .OrderBy(pi => pi.ProductImage_DisplayOrder)
            .ToListAsync();

        return Ok(images);
    }
}

// Request DTO
public class UploadImageRequest
{
    public int ProductId { get; set; }
    public IFormFile Image { get; set; } = null!;
    public bool IsMain { get; set; } = false;
}