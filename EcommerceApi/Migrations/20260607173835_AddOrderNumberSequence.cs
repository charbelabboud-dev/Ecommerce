using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderNumberSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'OrderNumberSeq' AND schema_id = SCHEMA_ID('dbo'))
                BEGIN
                    CREATE SEQUENCE dbo.OrderNumberSeq AS INT START WITH 1 INCREMENT BY 1;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP SEQUENCE IF EXISTS dbo.OrderNumberSeq;");
        }
    }
}
