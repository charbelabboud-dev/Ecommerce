using System;

namespace EcommerceApi.Models;

public class Review
{
    public int Review_Id { get; set; }
    public int Review_ProductId { get; set; }
    public string Review_CustomerName { get; set; } = string.Empty;
    public string Review_CustomerEmail { get; set; } = string.Empty;
    public int Review_Rating { get; set; }
    public string Review_Comment { get; set; } = string.Empty;
    public bool Review_IsApproved { get; set; } = false;
    public DateTime Review_CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Product? Product { get; set; }
}