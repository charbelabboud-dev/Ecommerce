using System;

namespace EcommerceApi.Models;

public class ProductImage
{
    public int ProductImage_Id { get; set; }
    public int ProductImage_ProductId { get; set; }
    public string ProductImage_ImageUrl { get; set; } = string.Empty;
    public bool ProductImage_IsMain { get; set; } = false;
    public int ProductImage_DisplayOrder { get; set; } = 0;
    public DateTime ProductImage_CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Product? Product { get; set; }
}