using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.DTOs;
using EcommerceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailService _emailService;

    public OrdersController(AppDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var customerIdClaim = User.FindFirst("CustomerId");
        if (customerIdClaim == null)
        {
            return Unauthorized(new { message = "Please login to place an order." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var admin = await _context.AdminUsers
                .FirstOrDefaultAsync(a => a.AdminUser_IsActive);

            if (admin == null)
            {
                return BadRequest(new { message = "Store is not configured. No active admin found." });
            }

            var order = new Order
            {
                Order_CustomerName = dto.Order_CustomerName,
                Order_CustomerPhone = dto.Order_CustomerPhone,
                Order_CustomerEmail = dto.Order_CustomerEmail,
                Order_CustomerAddress = dto.Order_CustomerAddress,
                Order_Currency = dto.Order_Currency,
                Order_SubtotalUSD = dto.Order_SubtotalUSD,
                Order_SubtotalLBP = dto.Order_SubtotalLBP,
                Order_ShippingFeeUSD = dto.Order_ShippingFeeUSD,
                Order_ShippingFeeLBP = dto.Order_ShippingFeeLBP,
                Order_TotalAmountUSD = dto.Order_TotalAmountUSD,
                Order_TotalAmountLBP = dto.Order_TotalAmountLBP,
                Order_Notes = dto.Order_Notes,
                OrderItems = dto.OrderItems.Select(item => new OrderItem
                {
                    OrderItem_ProductId = item.OrderItem_ProductId,
                    OrderItem_ProductName = item.OrderItem_ProductName,
                    OrderItem_ProductSKU = item.OrderItem_ProductSKU,
                    OrderItem_Quantity = item.OrderItem_Quantity,
                    OrderItem_UnitPriceUSD = item.OrderItem_UnitPriceUSD,
                    OrderItem_UnitPriceLBP = item.OrderItem_UnitPriceLBP,
                    OrderItem_TotalPriceUSD = item.OrderItem_TotalPriceUSD,
                    OrderItem_TotalPriceLBP = item.OrderItem_TotalPriceLBP
                }).ToList()
            };

            order.Order_CustomerId = int.Parse(customerIdClaim.Value);

            order.Order_Number = await GenerateOrderNumberAsync();
            order.Order_AdminUserId = admin.AdminUser_Id;
            order.Order_CreatedAt = DateTime.UtcNow;
            order.Order_UpdatedAt = DateTime.UtcNow;
            order.Order_Status = "Pending";
            order.Order_PaymentStatus = "Unpaid";

            if (order.Order_TotalAmountUSD == null && order.Order_TotalAmountLBP == null)
            {
                CalculateOrderTotals(order);
            }

            foreach (var item in order.OrderItems)
            {
                int rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Products SET Product_Stock = Product_Stock - {0}, Product_UpdatedAt = {1} WHERE Product_Id = {2} AND Product_Stock >= {0}",
                    item.OrderItem_Quantity, DateTime.UtcNow, item.OrderItem_ProductId);

                if (rowsAffected == 0)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = $"Insufficient stock for product ID {item.OrderItem_ProductId}." });
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            if (!string.IsNullOrWhiteSpace(order.Order_CustomerEmail) && _emailService.IsConfigured())
            {
                try
                {
                    var storeName = admin.AdminUser_StoreName ?? "Our Store";
                    await _emailService.SendEmailAsync(
                        order.Order_CustomerEmail,
                        $"Order Confirmation — {order.Order_Number}",
                        BuildOrderConfirmationEmail(order, storeName));
                }
                catch
                {
                    // Order succeeded; email failure should not fail the response
                }
            }

            return CreatedAtAction(nameof(GetOrder), new { id = order.Order_Id }, order);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "An error occurred while processing your order. Please try again." });
        }
    }

    [Authorize]
    [HttpGet("customer")]
    public async Task<ActionResult<IEnumerable<Order>>> GetCustomerOrders()
    {
        var customerIdClaim = User.FindFirst("CustomerId");
        if (customerIdClaim == null)
        {
            return Unauthorized(new { message = "Please login to view your orders" });
        }

        var customerId = int.Parse(customerIdClaim.Value);

        var orders = await _context.Orders
            .Where(o => o.Order_CustomerId == customerId)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.Order_CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.Order_CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Order_Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID {id} not found." });
        }

        return Ok(order);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID {id} not found." });
        }

        var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(status))
        {
            return BadRequest(new { message = $"Invalid status. Allowed values: {string.Join(", ", validStatuses)}" });
        }

        order.Order_Status = status;
        order.Order_UpdatedAt = DateTime.UtcNow;

        if (status == "Delivered")
        {
            order.Order_PaymentStatus = "Paid";
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Order {order.Order_Number} status updated to {status}", order });
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var nextNumber = await _context.Database
            .SqlQueryRaw<int>("SELECT nextval('order_number_seq')")
            .FirstAsync();

        string datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        return $"ORD-{datePart}-{nextNumber:D6}";
    }

    private static void CalculateOrderTotals(Order order)
    {
        if (order.OrderItems == null || !order.OrderItems.Any())
            return;

        if (order.Order_Currency == "USD")
        {
            order.Order_SubtotalUSD = order.OrderItems.Sum(i => i.OrderItem_TotalPriceUSD);
            order.Order_TotalAmountUSD = order.Order_SubtotalUSD + (order.Order_ShippingFeeUSD ?? 0);
        }
        else if (order.Order_Currency == "LBP")
        {
            order.Order_SubtotalLBP = order.OrderItems.Sum(i => i.OrderItem_TotalPriceLBP);
            order.Order_TotalAmountLBP = order.Order_SubtotalLBP + (order.Order_ShippingFeeLBP ?? 0);
        }
    }

    private static string BuildOrderConfirmationEmail(Order order, string storeName)
    {
        var sb = new StringBuilder();
        sb.Append("<html><body style='font-family: Arial, sans-serif; color: #0f172a;'>");
        sb.Append($"<h2 style='color: #0c1f3d;'>Thank you for your order!</h2>");
        sb.Append($"<p>Hi {System.Net.WebUtility.HtmlEncode(order.Order_CustomerName)},</p>");
        sb.Append($"<p>We've received your order at <strong>{System.Net.WebUtility.HtmlEncode(storeName)}</strong>.</p>");
        sb.Append($"<p><strong>Order number:</strong> {order.Order_Number}</p>");
        sb.Append("<table style='width:100%; border-collapse: collapse; margin: 16px 0;'>");
        sb.Append("<tr style='background:#f4f6f9;'><th style='text-align:left; padding:8px;'>Item</th><th style='padding:8px;'>Qty</th><th style='text-align:right; padding:8px;'>Total</th></tr>");

        foreach (var item in order.OrderItems)
        {
            var lineTotal = order.Order_Currency == "USD"
                ? $"${item.OrderItem_TotalPriceUSD:F2}"
                : $"{item.OrderItem_TotalPriceLBP:N0} LBP";

            sb.Append("<tr>");
            sb.Append($"<td style='padding:8px; border-bottom:1px solid #e2e8f0;'>{System.Net.WebUtility.HtmlEncode(item.OrderItem_ProductName)}</td>");
            sb.Append($"<td style='padding:8px; border-bottom:1px solid #e2e8f0; text-align:center;'>{item.OrderItem_Quantity}</td>");
            sb.Append($"<td style='padding:8px; border-bottom:1px solid #e2e8f0; text-align:right;'>{lineTotal}</td>");
            sb.Append("</tr>");
        }

        sb.Append("</table>");

        var grandTotal = order.Order_Currency == "USD"
            ? $"${order.Order_TotalAmountUSD:F2}"
            : $"{order.Order_TotalAmountLBP:N0} LBP";

        sb.Append($"<p><strong>Total:</strong> {grandTotal}</p>");
        sb.Append($"<p><strong>Delivery address:</strong> {System.Net.WebUtility.HtmlEncode(order.Order_CustomerAddress)}</p>");
        sb.Append("<p>Payment: Cash on delivery. We'll contact you when your order ships.</p>");
        sb.Append($"<p style='color:#64748b; font-size:14px;'>Questions? Reply to this email or contact {System.Net.WebUtility.HtmlEncode(storeName)}.</p>");
        sb.Append("</body></html>");
        return sb.ToString();
    }
}

