using System;

namespace EcommerceApi.Models;

public class Customer
{
    public int Customer_Id { get; set; }
    public string Customer_Name { get; set; } = string.Empty;
    public string Customer_Email { get; set; } = string.Empty;
    public string Customer_PasswordHash { get; set; } = string.Empty;
    public string Customer_Phone { get; set; } = string.Empty;
    public string? Customer_Address { get; set; }
    public bool IsEmailConfirmed { get; set; } = false;
    public DateTime Customer_CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime Customer_UpdatedAt { get; set; } = DateTime.UtcNow;
}