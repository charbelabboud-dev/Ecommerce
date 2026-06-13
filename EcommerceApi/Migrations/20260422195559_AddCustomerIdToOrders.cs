using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerIdToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order_CustomerId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Order_CustomerId",
                table: "Orders",
                column: "Order_CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Customers_Order_CustomerId",
                table: "Orders",
                column: "Order_CustomerId",
                principalTable: "Customers",
                principalColumn: "Customer_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Customers_Order_CustomerId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Order_CustomerId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Order_CustomerId",
                table: "Orders");
        }
    }
}
