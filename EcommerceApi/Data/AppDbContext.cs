using Microsoft.EntityFrameworkCore;
using EcommerceApi.Models;

namespace EcommerceApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet properties (one per table)
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // ========== AdminUser Configuration ==========
    modelBuilder.Entity<AdminUser>(entity =>
    {
        entity.HasKey(e => e.AdminUser_Id);

        entity.Property(e => e.AdminUser_Username)
            .IsRequired()
            .HasMaxLength(100);

        entity.HasIndex(e => e.AdminUser_Username)
            .IsUnique();

        entity.Property(e => e.AdminUser_PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(e => e.AdminUser_Email)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(e => e.AdminUser_StoreName)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(e => e.AdminUser_StorePhone)
            .IsRequired()
            .HasMaxLength(50);

        entity.Property(e => e.AdminUser_StoreAddress)
            .HasMaxLength(500);

        entity.Property(e => e.AdminUser_StoreLogo)
            .HasMaxLength(500);
    });

    // ========== Product Configuration ==========
    modelBuilder.Entity<Product>(entity =>
    {
        entity.HasKey(e => e.Product_Id);

        entity.Property(e => e.Product_Name)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(e => e.Product_SKU)
            .HasMaxLength(100);

        // Relationship: Product -> AdminUser
        entity.HasOne(e => e.AdminUser)
            .WithMany(a => a.Products)
            .HasForeignKey(e => e.Product_AdminUserId);
    });

    // ========== ProductImage Configuration ==========
    modelBuilder.Entity<ProductImage>(entity =>
    {
        entity.HasKey(e => e.ProductImage_Id);

        entity.Property(e => e.ProductImage_ImageUrl)
            .IsRequired()
            .HasMaxLength(500);

        // Relationship: ProductImage -> Product (Cascade delete)
        entity.HasOne(e => e.Product)
            .WithMany(p => p.ProductImages)
            .HasForeignKey(e => e.ProductImage_ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // ========== Order Configuration ==========
    modelBuilder.Entity<Order>(entity =>
    {
        entity.HasKey(e => e.Order_Id);

        entity.Property(e => e.Order_Number)
            .IsRequired()
            .HasMaxLength(50);

        entity.HasIndex(e => e.Order_Number)
            .IsUnique();

        entity.Property(e => e.Order_CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(e => e.Order_CustomerPhone)
            .IsRequired()
            .HasMaxLength(50);

        entity.Property(e => e.Order_CustomerEmail)
            .HasMaxLength(200);

        entity.Property(e => e.Order_CustomerAddress)
            .IsRequired()
            .HasMaxLength(500);

        entity.Property(e => e.Order_Currency)
            .IsRequired()
            .HasMaxLength(3);

        entity.Property(e => e.Order_Status)
            .HasMaxLength(50);

        entity.Property(e => e.Order_PaymentMethod)
            .HasMaxLength(50);

        entity.Property(e => e.Order_PaymentStatus)
            .HasMaxLength(50);

        // Relationship: Order -> AdminUser
        entity.HasOne(e => e.AdminUser)
            .WithMany(a => a.Orders)
            .HasForeignKey(e => e.Order_AdminUserId);
    });

    // ========== OrderItem Configuration ==========
    modelBuilder.Entity<OrderItem>(entity =>
    {
        entity.HasKey(e => e.OrderItem_Id);

        entity.Property(e => e.OrderItem_ProductName)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(e => e.OrderItem_ProductSKU)
            .HasMaxLength(100);

        // Relationship: OrderItem -> Order (Cascade delete)
        entity.HasOne(e => e.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(e => e.OrderItem_OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relationship: OrderItem -> Product
        entity.HasOne(e => e.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(e => e.OrderItem_ProductId);
    });
}
}