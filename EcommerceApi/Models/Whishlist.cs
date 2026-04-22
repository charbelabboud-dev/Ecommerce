using System;

namespace EcommerceApi.Models;

public class Wishlist
{
    public int Wishlist_Id { get; set; }
    public int Wishlist_CustomerId { get; set; }  
    public int Wishlist_ProductId { get; set; }
    public DateTime Wishlist_CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Customer? Customer { get; set; }
    public virtual Product? Product { get; set; }
}