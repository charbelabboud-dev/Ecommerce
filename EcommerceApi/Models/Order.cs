using System;
using System.Collections.Generic;

namespace EcommerceApi.Models;

public class Order
{
    public int Order_Id { get; set; }
    public int Order_AdminUserId { get; set; }
    public string Order_Number { get; set; } = string.Empty;
    public string Order_CustomerName { get; set; } = string.Empty;
    public string Order_CustomerPhone { get; set; } = string.Empty;
    public string? Order_CustomerEmail { get; set; }
    public string Order_CustomerAddress { get; set; } = string.Empty;
    public decimal? Order_SubtotalUSD { get; set; }
    public decimal? Order_SubtotalLBP { get; set; }
    public decimal? Order_ShippingFeeUSD { get; set; } = 0;
    public decimal? Order_ShippingFeeLBP { get; set; } = 0;
    public decimal? Order_TotalAmountUSD { get; set; }
    public decimal? Order_TotalAmountLBP { get; set; }
    public string Order_Currency { get; set; } = string.Empty;
    public string Order_Status { get; set; } = "Pending";
    public string Order_PaymentMethod { get; set; } = "COD";
    public string Order_PaymentStatus { get; set; } = "Unpaid";
    public string? Order_Notes { get; set; }
    public string? Order_AdminNotes { get; set; }
    public DateTime Order_CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime Order_UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual AdminUser? AdminUser { get; set; }
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}