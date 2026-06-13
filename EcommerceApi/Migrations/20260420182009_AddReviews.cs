using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Review_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Review_ProductId = table.Column<int>(type: "int", nullable: false),
                    Review_CustomerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Review_CustomerEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Review_Rating = table.Column<int>(type: "int", nullable: false),
                    Review_Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Review_IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    Review_CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Review_ProductId",
                table: "Reviews",
                column: "Review_ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews");
        }
    }
}
