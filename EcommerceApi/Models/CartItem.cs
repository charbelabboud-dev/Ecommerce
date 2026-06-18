namespace EcommerceApi.Models;

public class CartItem
{
    public int CartItem_Id { get; set; }
    public int CartItem_CustomerId { get; set; }
    public int CartItem_ProductId { get; set; }
    public int? CartItem_VariantId { get; set; }
    public int CartItem_Quantity { get; set; }
    public DateTime CartItem_UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual Customer? Customer { get; set; }
    public virtual Product? Product { get; set; }
    public virtual ProductVariant? Variant { get; set; }
}
