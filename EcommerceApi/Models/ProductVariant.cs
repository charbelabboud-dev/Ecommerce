namespace EcommerceApi.Models;

public class ProductVariant
{
    public int ProductVariant_Id { get; set; }
    public int ProductVariant_ProductId { get; set; }
    public string? ProductVariant_Size { get; set; }
    public string? ProductVariant_Color { get; set; }
    public int ProductVariant_Stock { get; set; }
    public string? ProductVariant_SKU { get; set; }
    public decimal? ProductVariant_PriceAdjustmentUSD { get; set; }
    public decimal? ProductVariant_PriceAdjustmentLBP { get; set; }
    public bool ProductVariant_IsActive { get; set; } = true;

    public virtual Product? Product { get; set; }
}
