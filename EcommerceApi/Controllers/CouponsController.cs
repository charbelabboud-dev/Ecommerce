using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CouponsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Coupon>>> GetCoupons()
    {
        return Ok(await _context.Coupons.OrderByDescending(c => c.Coupon_CreatedAt).ToListAsync());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Coupon>> CreateCoupon(Coupon coupon)
    {
        coupon.Coupon_Code = coupon.Coupon_Code.Trim().ToUpperInvariant();
        coupon.Coupon_CreatedAt = DateTime.UtcNow;

        if (await _context.Coupons.AnyAsync(c => c.Coupon_Code == coupon.Coupon_Code))
            return BadRequest(new { message = "Coupon code already exists." });

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCoupons), coupon);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCoupon(int id, Coupon updated)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound();

        coupon.Coupon_Code = updated.Coupon_Code.Trim().ToUpperInvariant();
        coupon.Coupon_DiscountPercent = updated.Coupon_DiscountPercent;
        coupon.Coupon_DiscountAmountUSD = updated.Coupon_DiscountAmountUSD;
        coupon.Coupon_DiscountAmountLBP = updated.Coupon_DiscountAmountLBP;
        coupon.Coupon_MinOrderAmountUSD = updated.Coupon_MinOrderAmountUSD;
        coupon.Coupon_MinOrderAmountLBP = updated.Coupon_MinOrderAmountLBP;
        coupon.Coupon_UsageLimit = updated.Coupon_UsageLimit;
        coupon.Coupon_IsActive = updated.Coupon_IsActive;
        coupon.Coupon_ExpiresAt = updated.Coupon_ExpiresAt;

        await _context.SaveChangesAsync();
        return Ok(coupon);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound();

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Coupon deleted" });
    }

    [HttpPost("validate")]
    public async Task<ActionResult<object>> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Coupon_Code == code);

        if (coupon == null || !coupon.Coupon_IsActive)
            return BadRequest(new { message = "Invalid coupon code." });

        if (coupon.Coupon_ExpiresAt.HasValue && coupon.Coupon_ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "This coupon has expired." });

        if (coupon.Coupon_UsageLimit.HasValue && coupon.Coupon_UsedCount >= coupon.Coupon_UsageLimit)
            return BadRequest(new { message = "This coupon has reached its usage limit." });

        var currency = request.Currency?.ToUpperInvariant() ?? "USD";
        var subtotal = request.Subtotal;

        if (currency == "USD" && coupon.Coupon_MinOrderAmountUSD.HasValue && subtotal < coupon.Coupon_MinOrderAmountUSD)
            return BadRequest(new { message = $"Minimum order amount is ${coupon.Coupon_MinOrderAmountUSD:F2}." });

        if (currency == "LBP" && coupon.Coupon_MinOrderAmountLBP.HasValue && subtotal < coupon.Coupon_MinOrderAmountLBP)
            return BadRequest(new { message = $"Minimum order amount is {coupon.Coupon_MinOrderAmountLBP:N0} LBP." });

        decimal discountAmount = 0;
        if (coupon.Coupon_DiscountPercent.HasValue)
            discountAmount = subtotal * (coupon.Coupon_DiscountPercent.Value / 100m);
        else if (currency == "USD" && coupon.Coupon_DiscountAmountUSD.HasValue)
            discountAmount = coupon.Coupon_DiscountAmountUSD.Value;
        else if (currency == "LBP" && coupon.Coupon_DiscountAmountLBP.HasValue)
            discountAmount = coupon.Coupon_DiscountAmountLBP.Value;

        discountAmount = Math.Min(discountAmount, subtotal);

        return Ok(new
        {
            code = coupon.Coupon_Code,
            discountAmount,
            discountPercent = coupon.Coupon_DiscountPercent
        });
    }
}

public class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public decimal Subtotal { get; set; }
}
