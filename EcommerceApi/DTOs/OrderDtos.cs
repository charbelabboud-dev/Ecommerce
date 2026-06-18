using System.ComponentModel.DataAnnotations;

namespace EcommerceApi.DTOs;

public class CreateOrderItemDto
{
    [Required]
    public int OrderItem_ProductId { get; set; }

    [Required, StringLength(255)]
    public string OrderItem_ProductName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? OrderItem_ProductSKU { get; set; }

    [Required, Range(1, 999)]
    public int OrderItem_Quantity { get; set; }

    public decimal? OrderItem_UnitPriceUSD { get; set; }
    public decimal? OrderItem_UnitPriceLBP { get; set; }
    public decimal? OrderItem_TotalPriceUSD { get; set; }
    public decimal? OrderItem_TotalPriceLBP { get; set; }
    public int? OrderItem_VariantId { get; set; }
    public string? OrderItem_VariantDetails { get; set; }
}

public class CreateOrderDto
{
    [Required, StringLength(200, MinimumLength = 2)]
    public string Order_CustomerName { get; set; } = string.Empty;

    [Required, StringLength(50, MinimumLength = 7)]
    [RegularExpression(@"^[\d\s\-\+\(\)]{7,20}$", ErrorMessage = "Invalid phone number format.")]
    public string Order_CustomerPhone { get; set; } = string.Empty;

    [EmailAddress, StringLength(200)]
    public string? Order_CustomerEmail { get; set; }

    [Required, StringLength(500, MinimumLength = 5)]
    public string Order_CustomerAddress { get; set; } = string.Empty;

    [Required, RegularExpression("^(USD|LBP)$")]
    public string Order_Currency { get; set; } = string.Empty;

    public decimal? Order_SubtotalUSD { get; set; }
    public decimal? Order_SubtotalLBP { get; set; }
    public decimal? Order_ShippingFeeUSD { get; set; }
    public decimal? Order_ShippingFeeLBP { get; set; }
    public decimal? Order_TotalAmountUSD { get; set; }
    public decimal? Order_TotalAmountLBP { get; set; }

    [StringLength(500)]
    public string? Order_Notes { get; set; }

    [StringLength(50)]
    public string? Order_CouponCode { get; set; }

    [Required, MinLength(1)]
    public List<CreateOrderItemDto> OrderItems { get; set; } = new();
}

public class OrderLookupRequest
{
    [Phone]
    public string? Phone { get; set; }

    [EmailAddress]
    public string? Email { get; set; }
}
