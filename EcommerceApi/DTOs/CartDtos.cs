namespace EcommerceApi.DTOs;

using EcommerceApi.Models;

public class CartItemDto
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
}

public class SyncCartDto
{
    public List<CartItemDto> Items { get; set; } = new();
}

public class CartItemResponseDto
{
    public int CartItem_Id { get; set; }
    public int CartItem_ProductId { get; set; }
    public int? CartItem_VariantId { get; set; }
    public int CartItem_Quantity { get; set; }
    public Product? Product { get; set; }
    public ProductVariant? Variant { get; set; }
}
