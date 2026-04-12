using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/orders (Customer checkout)
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        // Generate a unique order number
        order.Order_Number = GenerateOrderNumber();
        
        // Set admin ID (hardcoded for V1 - admin ID 1)
        order.Order_AdminUserId = 1;
        
        // Set timestamps
        order.Order_CreatedAt = DateTime.UtcNow;
        order.Order_UpdatedAt = DateTime.UtcNow;
        
        // Set default statuses
        order.Order_Status = "Pending";
        order.Order_PaymentStatus = "Unpaid";
        
        // Calculate totals from OrderItems if not provided
        if (order.Order_TotalAmountUSD == null && order.Order_TotalAmountLBP == null)
        {
            CalculateOrderTotals(order);
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.Order_Id }, order);
    }

    // GET: api/orders (Admin views all orders)
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.Order_CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders/5 (Admin views single order)
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Order_Id == id);

        if (order == null)
        {
            return NotFound($"Order with ID {id} not found.");
        }

        return Ok(order);
    }

    // PUT: api/orders/5/status (Admin updates order status)
    [Authorize]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);
        
        if (order == null)
        {
            return NotFound($"Order with ID {id} not found.");
        }

        // Validate status
        var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(status))
        {
            return BadRequest($"Invalid status. Allowed values: {string.Join(", ", validStatuses)}");
        }

        order.Order_Status = status;
        order.Order_UpdatedAt = DateTime.UtcNow;
        
        // If status is Delivered, mark payment as paid (for COD)
        if (status == "Delivered")
        {
            order.Order_PaymentStatus = "Paid";
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Order {order.Order_Number} status updated to {status}", order });
    }

    // Helper: Generate unique order number
    private string GenerateOrderNumber()
    {
        // Format: ORD-20260111-0001
        string datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        int nextNumber = _context.Orders.Count() + 1;
        return $"ORD-{datePart}-{nextNumber:D4}";
    }

    // Helper: Calculate order totals from items
    private void CalculateOrderTotals(Order order)
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
}