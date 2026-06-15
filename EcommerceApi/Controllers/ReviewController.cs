using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reviews/product/5
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetProductReviews(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.Review_ProductId == productId && r.Review_IsApproved == true)
            .OrderByDescending(r => r.Review_CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    // GET: api/reviews/product/5/rating
    [HttpGet("product/{productId}/rating")]
    public async Task<ActionResult<object>> GetProductRating(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.Review_ProductId == productId && r.Review_IsApproved == true)
            .ToListAsync();

        var averageRating = reviews.Any() ? reviews.Average(r => r.Review_Rating) : 0;
        var reviewCount = reviews.Count;

        return Ok(new { averageRating, reviewCount });
    }

    // POST: api/reviews
    [HttpPost]
    public async Task<ActionResult<Review>> CreateReview(Review review)
    {
        review.Review_CreatedAt = DateTime.UtcNow;
        review.Review_IsApproved = false;

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review submitted successfully! Awaiting approval." });
    }

    // GET: api/reviews/pending (Admin only)
    [Authorize (Roles = "Admin")]
    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<Review>>> GetPendingReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => r.Review_IsApproved == false)
            .Include(r => r.Product)
            .OrderBy(r => r.Review_CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    // GET: api/reviews/approved (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpGet("approved")]
    public async Task<ActionResult<IEnumerable<Review>>> GetApprovedReviews()
    {
        var reviews = await _context.Reviews
            .Where(r => r.Review_IsApproved == true)
            .Include(r => r.Product)
            .OrderByDescending(r => r.Review_CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    // PUT: api/reviews/5/approve (Admin only)
    [Authorize (Roles = "Admin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
        {
            return NotFound();
        }

        review.Review_IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review approved successfully" });
    }

    // DELETE: api/reviews/5 (Admin only)
    [Authorize (Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
        {
            return NotFound();
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review deleted successfully" });
    }
}