using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
namespace EcommerceApi.Models;

public class Product
{
    public int Product_Id { get; set; }
    public int Product_AdminUserId { get; set; }

    public string Product_Name { get; set; } = string.Empty;
    public string? Product_Description { get; set; }
    public string? Product_ShortDescription { get; set; }
    public decimal? Product_PriceUSD { get; set; }
    public decimal? Product_PriceLBP { get; set; }
    public decimal? Product_CompareAtPriceUSD { get; set; }
    public decimal? Product_CompareAtPriceLBP { get; set; }
    public int? Product_Stock { get; set; }           
    public string? Product_SKU { get; set; }          
    public bool Product_IsActive { get; set; } = true;
    public bool Product_IsFeatured { get; set; } = false;  
    public DateTime Product_CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime Product_UpdatedAt { get; set; } = DateTime.UtcNow;
    public int? Product_CategoryId { get; set; }
    public decimal? Product_ShippingFee { get; set; }
    public decimal? Product_DiscountPercent { get; set; }

    [NotMapped]
    public decimal? Product_EffectiveDiscountPercent { get; set; }

    [NotMapped]
    public decimal? Product_DiscountedPriceUSD { get; set; }

    [NotMapped]
    public decimal? Product_DiscountedPriceLBP { get; set; }

    public virtual Category? Category { get; set; }

    public virtual AdminUser? AdminUser { get; set; }
    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}