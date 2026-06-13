using EcommerceApi.Models;

namespace EcommerceApi.Services;

public static class DiscountHelper
{
    public static decimal? GetEffectiveDiscountPercent(Product product)
    {
        if (product.Product_DiscountPercent is > 0 and <= 100)
        {
            return product.Product_DiscountPercent;
        }

        if (product.Category?.Category_DiscountPercent is > 0 and <= 100)
        {
            return product.Category.Category_DiscountPercent;
        }

        return null;
    }

    public static void ApplyDiscountFields(Product product)
    {
        var discount = GetEffectiveDiscountPercent(product);
        product.Product_EffectiveDiscountPercent = discount;

        if (discount is not > 0)
        {
            product.Product_DiscountedPriceUSD = null;
            product.Product_DiscountedPriceLBP = null;
            return;
        }

        var multiplier = 1 - (discount.Value / 100m);

        if (product.Product_PriceUSD.HasValue)
        {
            product.Product_DiscountedPriceUSD = Math.Round(product.Product_PriceUSD.Value * multiplier, 2);
        }

        if (product.Product_PriceLBP.HasValue)
        {
            product.Product_DiscountedPriceLBP = Math.Round(product.Product_PriceLBP.Value * multiplier, 0);
        }
    }

    public static void ApplyDiscountFields(IEnumerable<Product> products)
    {
        foreach (var product in products)
        {
            ApplyDiscountFields(product);
        }
    }
}
