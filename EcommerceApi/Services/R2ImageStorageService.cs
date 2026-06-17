using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace EcommerceApi.Services;

public class R2ImageStorageService : IImageStorageService
{
    private readonly R2Settings _settings;
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<R2ImageStorageService> _logger;

    public R2ImageStorageService(IOptions<R2Settings> settings, ILogger<R2ImageStorageService> logger)
    {
        _settings = settings.Value;
        _logger = logger;

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_settings.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true
        };

        _s3Client = new AmazonS3Client(_settings.AccessKeyId, _settings.SecretAccessKey, config);
    }

    public async Task<string> UploadProductImageAsync(int productId, IFormFile file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var objectKey = $"products/{productId}_{DateTime.UtcNow.Ticks}{extension}";

        await using var stream = file.OpenReadStream();
        var request = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = GetContentType(extension),
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true
        };

        await _s3Client.PutObjectAsync(request, cancellationToken);

        var publicUrl = $"{_settings.PublicUrl.TrimEnd('/')}/{objectKey}";
        _logger.LogInformation("Uploaded product image to R2: {Key}", objectKey);
        return publicUrl;
    }

    public async Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        var objectKey = TryGetObjectKey(imageUrl);
        if (objectKey == null)
        {
            _logger.LogWarning("Could not resolve R2 object key for image URL: {Url}", imageUrl);
            return;
        }

        try
        {
            await _s3Client.DeleteObjectAsync(_settings.BucketName, objectKey, cancellationToken);
            _logger.LogInformation("Deleted product image from R2: {Key}", objectKey);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete R2 object {Key}", objectKey);
        }
    }

    private string? TryGetObjectKey(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return null;
        }

        if (imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri))
            {
                return null;
            }

            return uri.AbsolutePath.TrimStart('/');
        }

        return imageUrl.TrimStart('/');
    }

    private static string GetContentType(string extension) => extension switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".gif" => "image/gif",
        _ => "application/octet-stream"
    };
}
