using System;

namespace EcommerceApi.Models;

public class Wishlist
{
    public int Wishlist_Id { get; set; }
    public string Wishlist_CustomerEmail { get; set; } = string.Empty;
    public int Wishlist_ProductId { get; set; }
    public DateTime Wishlist_CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Product? Product { get; set; }
}