using System;

namespace EcommerceApi.Models;

public class OrderItem
{
    public int OrderItem_Id { get; set; }
    public int OrderItem_OrderId { get; set; }
    public int OrderItem_ProductId { get; set; }
    public string OrderItem_ProductName { get; set; } = string.Empty;
    public string? OrderItem_ProductSKU { get; set; }
    public int OrderItem_Quantity { get; set; }
    public decimal? OrderItem_UnitPriceUSD { get; set; }
    public decimal? OrderItem_UnitPriceLBP { get; set; }
    public decimal? OrderItem_TotalPriceUSD { get; set; }
    public decimal? OrderItem_TotalPriceLBP { get; set; }

    public virtual Order? Order { get; set; }
    public virtual Product? Product { get; set; }
}