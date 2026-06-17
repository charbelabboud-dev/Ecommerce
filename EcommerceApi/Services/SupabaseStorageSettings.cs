namespace EcommerceApi.Services;

public class SupabaseStorageSettings
{
    public string SupabaseUrl { get; set; } = string.Empty;
    public string ServiceRoleKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "product-images";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(SupabaseUrl) &&
        !string.IsNullOrWhiteSpace(ServiceRoleKey) &&
        !string.IsNullOrWhiteSpace(BucketName);
}
