using System.Net.Http.Headers;
using Microsoft.Extensions.Options;

namespace EcommerceApi.Services;

public class SupabaseImageStorageService : IImageStorageService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SupabaseStorageSettings _settings;
    private readonly ILogger<SupabaseImageStorageService> _logger;

    public SupabaseImageStorageService(
        IHttpClientFactory httpClientFactory,
        IOptions<SupabaseStorageSettings> settings,
        ILogger<SupabaseImageStorageService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> UploadProductImageAsync(int productId, IFormFile file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var objectKey = $"products/{productId}_{DateTime.UtcNow.Ticks}{extension}";
        var client = CreateClient();

        await using var stream = file.OpenReadStream();
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"storage/v1/object/{_settings.BucketName}/{objectKey}");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ServiceRoleKey);
        request.Content = new StreamContent(stream);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(GetContentType(extension));

        var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Supabase upload failed ({(int)response.StatusCode}): {errorBody}");
        }

        var publicUrl = $"{_settings.SupabaseUrl.TrimEnd('/')}/storage/v1/object/public/{_settings.BucketName}/{objectKey}";
        _logger.LogInformation("Uploaded product image to Supabase: {Key}", objectKey);
        return publicUrl;
    }

    public async Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        var objectKey = TryGetObjectKey(imageUrl);
        if (objectKey == null)
        {
            _logger.LogWarning("Could not resolve Supabase object key for image URL: {Url}", imageUrl);
            return;
        }

        var client = CreateClient();
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"storage/v1/object/{_settings.BucketName}/{objectKey}");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ServiceRoleKey);

        var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning(
                "Failed to delete Supabase object {Key} ({Status}): {Body}",
                objectKey,
                (int)response.StatusCode,
                errorBody);
            return;
        }

        _logger.LogInformation("Deleted product image from Supabase: {Key}", objectKey);
    }

    private HttpClient CreateClient()
    {
        var client = _httpClientFactory.CreateClient("SupabaseStorage");
        client.BaseAddress = new Uri(_settings.SupabaseUrl.TrimEnd('/') + "/");
        return client;
    }

    private string? TryGetObjectKey(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return null;
        }

        var publicPrefix = $"/storage/v1/object/public/{_settings.BucketName}/";
        if (imageUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase) &&
            Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) &&
            uri.AbsolutePath.Contains(publicPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var index = uri.AbsolutePath.IndexOf(publicPrefix, StringComparison.OrdinalIgnoreCase);
            return uri.AbsolutePath[(index + publicPrefix.Length)..];
        }

        if (imageUrl.StartsWith("products/", StringComparison.OrdinalIgnoreCase))
        {
            return imageUrl;
        }

        return null;
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
