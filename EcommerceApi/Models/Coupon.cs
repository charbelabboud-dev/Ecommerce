namespace EcommerceApi.Models;

public class Coupon
{
    public int Coupon_Id { get; set; }
    public string Coupon_Code { get; set; } = string.Empty;
    public decimal? Coupon_DiscountPercent { get; set; }
    public decimal? Coupon_DiscountAmountUSD { get; set; }
    public decimal? Coupon_DiscountAmountLBP { get; set; }
    public decimal? Coupon_MinOrderAmountUSD { get; set; }
    public decimal? Coupon_MinOrderAmountLBP { get; set; }
    public int? Coupon_UsageLimit { get; set; }
    public int Coupon_UsedCount { get; set; } = 0;
    public bool Coupon_IsActive { get; set; } = true;
    public DateTime? Coupon_ExpiresAt { get; set; }
    public DateTime Coupon_CreatedAt { get; set; } = DateTime.UtcNow;
}
