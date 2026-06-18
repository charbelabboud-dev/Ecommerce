namespace EcommerceApi.DTOs;

public class BulkProductActionDto
{
    public List<int> ProductIds { get; set; } = new();
    public string Action { get; set; } = string.Empty; // activate, deactivate, setDiscount
    public decimal? DiscountPercent { get; set; }
}
