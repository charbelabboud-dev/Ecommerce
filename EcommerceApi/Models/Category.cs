using System;
using System.Collections.Generic;

namespace EcommerceApi.Models;

public class Category
{
    public int Category_Id { get; set; }
    public string Category_Name { get; set; } = string.Empty;
    public string Category_Slug { get; set; } = string.Empty;
    public string? Category_Description { get; set; }
    public string? Category_ImageUrl { get; set; }
    public int Category_DisplayOrder { get; set; } = 0;
    public bool Category_IsActive { get; set; } = true;
    public decimal? Category_DiscountPercent { get; set; }
    public int? Category_ParentId { get; set; }
    public DateTime Category_CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime Category_UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual Category? Parent { get; set; }
    public virtual ICollection<Category> Subcategories { get; set; } = new List<Category>();
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}