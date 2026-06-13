using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminUsers",
                columns: table => new
                {
                    AdminUser_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AdminUser_Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AdminUser_PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AdminUser_Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AdminUser_StoreName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AdminUser_StorePhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AdminUser_StoreAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AdminUser_StoreLogo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AdminUser_IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AdminUser_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdminUser_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdminUser_ShippingFeeUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    AdminUser_ShippingFeeLBP = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminUsers", x => x.AdminUser_Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Category_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Category_Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category_Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category_Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category_ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category_DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Category_IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Category_DiscountPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    Category_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Category_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Category_Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Customer_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Customer_Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Customer_Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Customer_PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Customer_Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Customer_Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsEmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    Customer_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Customer_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Customer_Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailVerificationOtps",
                columns: table => new
                {
                    Otp_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Otp_Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Otp_Code = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    Otp_ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Otp_IsUsed = table.Column<bool>(type: "boolean", nullable: false),
                    Otp_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailVerificationOtps", x => x.Otp_Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Product_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Product_AdminUserId = table.Column<int>(type: "integer", nullable: false),
                    Product_Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Product_Description = table.Column<string>(type: "text", nullable: true),
                    Product_ShortDescription = table.Column<string>(type: "text", nullable: true),
                    Product_PriceUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Product_PriceLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Product_CompareAtPriceUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Product_CompareAtPriceLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Product_Stock = table.Column<int>(type: "integer", nullable: true),
                    Product_SKU = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Product_IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Product_IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    Product_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Product_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Product_CategoryId = table.Column<int>(type: "integer", nullable: true),
                    Product_ShippingFee = table.Column<decimal>(type: "numeric", nullable: true),
                    Product_DiscountPercent = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Product_Id);
                    table.ForeignKey(
                        name: "FK_Products_AdminUsers_Product_AdminUserId",
                        column: x => x.Product_AdminUserId,
                        principalTable: "AdminUsers",
                        principalColumn: "AdminUser_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Products_Categories_Product_CategoryId",
                        column: x => x.Product_CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Category_Id");
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Order_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Order_AdminUserId = table.Column<int>(type: "integer", nullable: false),
                    Order_Number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Order_CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Order_CustomerPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Order_CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Order_CustomerAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Order_SubtotalUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_SubtotalLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_ShippingFeeUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_ShippingFeeLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_TotalAmountUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_TotalAmountLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Order_Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Order_Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Order_PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Order_PaymentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Order_Notes = table.Column<string>(type: "text", nullable: true),
                    Order_AdminNotes = table.Column<string>(type: "text", nullable: true),
                    Order_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Order_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Order_CustomerId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Order_Id);
                    table.ForeignKey(
                        name: "FK_Orders_AdminUsers_Order_AdminUserId",
                        column: x => x.Order_AdminUserId,
                        principalTable: "AdminUsers",
                        principalColumn: "AdminUser_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Orders_Customers_Order_CustomerId",
                        column: x => x.Order_CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Customer_Id");
                });

            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    ProductImage_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductImage_ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductImage_ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ProductImage_IsMain = table.Column<bool>(type: "boolean", nullable: false),
                    ProductImage_DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    ProductImage_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.ProductImage_Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductImage_ProductId",
                        column: x => x.ProductImage_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Review_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Review_ProductId = table.Column<int>(type: "integer", nullable: false),
                    Review_CustomerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Review_CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Review_Rating = table.Column<int>(type: "integer", nullable: false),
                    Review_Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Review_IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    Review_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Review_Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Products_Review_ProductId",
                        column: x => x.Review_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wishlists",
                columns: table => new
                {
                    Wishlist_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Wishlist_CustomerId = table.Column<int>(type: "integer", nullable: false),
                    Wishlist_ProductId = table.Column<int>(type: "integer", nullable: false),
                    Wishlist_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wishlists", x => x.Wishlist_Id);
                    table.ForeignKey(
                        name: "FK_Wishlists_Customers_Wishlist_CustomerId",
                        column: x => x.Wishlist_CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Customer_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Wishlists_Products_Wishlist_ProductId",
                        column: x => x.Wishlist_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    OrderItem_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderItem_OrderId = table.Column<int>(type: "integer", nullable: false),
                    OrderItem_ProductId = table.Column<int>(type: "integer", nullable: false),
                    OrderItem_ProductName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    OrderItem_ProductSKU = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OrderItem_Quantity = table.Column<int>(type: "integer", nullable: false),
                    OrderItem_UnitPriceUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    OrderItem_UnitPriceLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    OrderItem_TotalPriceUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    OrderItem_TotalPriceLBP = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.OrderItem_Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderItem_OrderId",
                        column: x => x.OrderItem_OrderId,
                        principalTable: "Orders",
                        principalColumn: "Order_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_OrderItem_ProductId",
                        column: x => x.OrderItem_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminUsers_AdminUser_Username",
                table: "AdminUsers",
                column: "AdminUser_Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Category_Name",
                table: "Categories",
                column: "Category_Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Category_Slug",
                table: "Categories",
                column: "Category_Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Customer_Email",
                table: "Customers",
                column: "Customer_Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderItem_OrderId",
                table: "OrderItems",
                column: "OrderItem_OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderItem_ProductId",
                table: "OrderItems",
                column: "OrderItem_ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Order_AdminUserId",
                table: "Orders",
                column: "Order_AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Order_CustomerId",
                table: "Orders",
                column: "Order_CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Order_Number",
                table: "Orders",
                column: "Order_Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductImage_ProductId",
                table: "ProductImages",
                column: "ProductImage_ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Product_AdminUserId",
                table: "Products",
                column: "Product_AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Product_CategoryId",
                table: "Products",
                column: "Product_CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Review_ProductId",
                table: "Reviews",
                column: "Review_ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_Wishlist_CustomerId",
                table: "Wishlists",
                column: "Wishlist_CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_Wishlist_ProductId",
                table: "Wishlists",
                column: "Wishlist_ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailVerificationOtps");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "ProductImages");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Wishlists");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "AdminUsers");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
