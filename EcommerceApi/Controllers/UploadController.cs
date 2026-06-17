using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.Services;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorage;

    public UploadController(AppDbContext context, IImageStorageService imageStorage)
    {
        _context = context;
        _imageStorage = imageStorage;
    }

    // POST: api/upload/product-image
    [Authorize (Roles = "Admin")]
    [HttpPost("product-image")]
    public async Task<ActionResult<ProductImage>> UploadProductImage([FromForm] UploadImageRequest request)
    {
        try
        {
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound($"Product with ID {request.ProductId} not found.");
            }

            if (request.Image == null || request.Image.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var fileExtension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest($"Invalid file type. Allowed: {string.Join(", ", allowedExtensions)}");
            }

            if (request.Image.Length > 5 * 1024 * 1024)
            {
                return BadRequest("File size exceeds 5MB limit.");
            }

            var imageUrl = await _imageStorage.UploadProductImageAsync(request.ProductId, request.Image);

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

            var maxOrder = await _context.ProductImages
                .Where(pi => pi.ProductImage_ProductId == request.ProductId)
                .MaxAsync(pi => (int?)pi.ProductImage_DisplayOrder) ?? 0;

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

        await _imageStorage.DeleteImageAsync(productImage.ProductImage_ImageUrl);

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

public class UploadImageRequest
{
    public int ProductId { get; set; }
    public IFormFile Image { get; set; } = null!;
    public bool IsMain { get; set; } = false;
}
