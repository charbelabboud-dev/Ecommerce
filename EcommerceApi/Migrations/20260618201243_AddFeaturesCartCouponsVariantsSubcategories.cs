using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddFeaturesCartCouponsVariantsSubcategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Product_LowStockThreshold",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Order_CouponCode",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Order_CouponDiscountLBP",
                table: "Orders",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Order_CouponDiscountUSD",
                table: "Orders",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrderItem_VariantDetails",
                table: "OrderItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrderItem_VariantId",
                table: "OrderItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Category_ParentId",
                table: "Categories",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Coupon_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Coupon_Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Coupon_DiscountPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    Coupon_DiscountAmountUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Coupon_DiscountAmountLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Coupon_MinOrderAmountUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    Coupon_MinOrderAmountLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    Coupon_UsageLimit = table.Column<int>(type: "integer", nullable: true),
                    Coupon_UsedCount = table.Column<int>(type: "integer", nullable: false),
                    Coupon_IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Coupon_ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Coupon_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Coupon_Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    ProductVariant_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductVariant_ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductVariant_Size = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProductVariant_Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProductVariant_Stock = table.Column<int>(type: "integer", nullable: false),
                    ProductVariant_SKU = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProductVariant_PriceAdjustmentUSD = table.Column<decimal>(type: "numeric", nullable: true),
                    ProductVariant_PriceAdjustmentLBP = table.Column<decimal>(type: "numeric", nullable: true),
                    ProductVariant_IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.ProductVariant_Id);
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductVariant_ProductId",
                        column: x => x.ProductVariant_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    CartItem_Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CartItem_CustomerId = table.Column<int>(type: "integer", nullable: false),
                    CartItem_ProductId = table.Column<int>(type: "integer", nullable: false),
                    CartItem_VariantId = table.Column<int>(type: "integer", nullable: true),
                    CartItem_Quantity = table.Column<int>(type: "integer", nullable: false),
                    CartItem_UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.CartItem_Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Customers_CartItem_CustomerId",
                        column: x => x.CartItem_CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Customer_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_ProductVariants_CartItem_VariantId",
                        column: x => x.CartItem_VariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "ProductVariant_Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CartItems_Products_CartItem_ProductId",
                        column: x => x.CartItem_ProductId,
                        principalTable: "Products",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Category_ParentId",
                table: "Categories",
                column: "Category_ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartItem_CustomerId",
                table: "CartItems",
                column: "CartItem_CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartItem_ProductId",
                table: "CartItems",
                column: "CartItem_ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartItem_VariantId",
                table: "CartItems",
                column: "CartItem_VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Coupon_Code",
                table: "Coupons",
                column: "Coupon_Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_ProductVariant_ProductId",
                table: "ProductVariants",
                column: "ProductVariant_ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Categories_Category_ParentId",
                table: "Categories",
                column: "Category_ParentId",
                principalTable: "Categories",
                principalColumn: "Category_Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Categories_Category_ParentId",
                table: "Categories");

            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Category_ParentId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Product_LowStockThreshold",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Order_CouponCode",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Order_CouponDiscountLBP",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Order_CouponDiscountUSD",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "OrderItem_VariantDetails",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "OrderItem_VariantId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "Category_ParentId",
                table: "Categories");
        }
    }
}
