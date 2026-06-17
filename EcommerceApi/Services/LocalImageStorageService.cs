namespace EcommerceApi.Services;

public class LocalImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<LocalImageStorageService> _logger;

    public LocalImageStorageService(IWebHostEnvironment environment, ILogger<LocalImageStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> UploadProductImageAsync(int productId, IFormFile file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueFileName = $"{productId}_{DateTime.UtcNow.Ticks}{extension}";
        var uploadsFolder = Path.Combine(GetWebRootPath(), "uploads", "products");

        Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, uniqueFileName);
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        _logger.LogInformation("Saved product image locally at {Path}", filePath);
        return $"/uploads/products/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (!imageUrl.StartsWith('/'))
        {
            return Task.CompletedTask;
        }

        var imagePath = Path.Combine(GetWebRootPath(), imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(imagePath))
        {
            File.Delete(imagePath);
            _logger.LogInformation("Deleted local product image at {Path}", imagePath);
        }

        return Task.CompletedTask;
    }

    private string GetWebRootPath() =>
        _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
}
