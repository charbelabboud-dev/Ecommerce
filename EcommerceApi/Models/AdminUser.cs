using System;
using System.Collections.Generic;


namespace EcommerceApi.Models;

public class AdminUser
{
    public int AdminUser_Id {get; set;}
    public string AdminUser_Username{get; set;} = string.Empty;
    public string AdminUser_PasswordHash{get;set;} = string.Empty;
    public string AdminUser_Email{get; set;} = string.Empty;
    public string AdminUser_StoreName{get;set;} = string.Empty;
    public string AdminUser_StorePhone{get;set;} = string.Empty;
    public string? AdminUser_StoreAddress{get;set;}
    public string? AdminUser_StoreLogo{get;set;} 
    public bool AdminUser_IsActive{get;set;} = true;
    public DateTime AdminUser_CreatedAt{get;set;} = DateTime.UtcNow;
    public DateTime AdminUser_UpdatedAt{get;set;} = DateTime.UtcNow;
public decimal? AdminUser_ShippingFeeUSD { get; set; }
public decimal? AdminUser_ShippingFeeLBP { get; set; }


    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}