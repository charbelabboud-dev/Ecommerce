using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerAndOtpTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "AdminUser_ShippingFeeUSD",
                table: "AdminUsers",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AdminUser_ShippingFeeLBP",
                table: "AdminUsers",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Customer_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Customer_Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Customer_Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Customer_PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Customer_Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Customer_Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsEmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    Customer_CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Customer_UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Customer_Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailVerificationOtps",
                columns: table => new
                {
                    Otp_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Otp_Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Otp_Code = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    Otp_ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Otp_IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    Otp_CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailVerificationOtps", x => x.Otp_Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Customer_Email",
                table: "Customers",
                column: "Customer_Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "EmailVerificationOtps");

            migrationBuilder.AlterColumn<decimal>(
                name: "AdminUser_ShippingFeeUSD",
                table: "AdminUsers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AdminUser_ShippingFeeLBP",
                table: "AdminUsers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);
        }
    }
}
