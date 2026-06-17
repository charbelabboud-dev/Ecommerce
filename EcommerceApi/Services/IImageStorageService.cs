namespace EcommerceApi.Services;

public interface IImageStorageService
{
    Task<string> UploadProductImageAsync(int productId, IFormFile file, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
}
