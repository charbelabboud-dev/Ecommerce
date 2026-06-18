export function getEffectiveDiscountPercent(product) {
  if (!product) return null;
  if (product.product_EffectiveDiscountPercent > 0) {
    return product.product_EffectiveDiscountPercent;
  }
  if (product.product_DiscountPercent > 0) return product.product_DiscountPercent;
  if (product.category?.category_DiscountPercent > 0) return product.category.category_DiscountPercent;
  return null;
}

export function hasDiscount(product) {
  return getEffectiveDiscountPercent(product) > 0;
}

export function getSalePriceUSD(product) {
  if (product?.product_DiscountedPriceUSD != null) return product.product_DiscountedPriceUSD;
  const discount = getEffectiveDiscountPercent(product);
  if (!discount || !product?.product_PriceUSD) return product?.product_PriceUSD ?? null;
  return Math.round(product.product_PriceUSD * (1 - discount / 100) * 100) / 100;
}

export function getSalePriceLBP(product) {
  if (product?.product_DiscountedPriceLBP != null) return product.product_DiscountedPriceLBP;
  const discount = getEffectiveDiscountPercent(product);
  if (!discount || !product?.product_PriceLBP) return product?.product_PriceLBP ?? null;
  return Math.round(product.product_PriceLBP * (1 - discount / 100));
}

export function getUnitPrice(product) {
  if (product?.product_PriceUSD) {
    return hasDiscount(product) ? getSalePriceUSD(product) : product.product_PriceUSD;
  }
  if (product?.product_PriceLBP) {
    return hasDiscount(product) ? getSalePriceLBP(product) : product.product_PriceLBP;
  }
  return 0;
}

export function formatUSD(price) {
  if (price == null) return 'N/A';
  return `$${Number(price).toFixed(2)}`;
}

export function formatLBP(price) {
  if (price == null) return 'N/A';
  return `${Number(price).toLocaleString()} LBP`;
}

export function formatProductPrice(product, useSale = true) {
  if (product?.product_PriceUSD) {
    const price = useSale && hasDiscount(product) ? getSalePriceUSD(product) : product.product_PriceUSD;
    return formatUSD(price);
  }
  if (product?.product_PriceLBP) {
    const price = useSale && hasDiscount(product) ? getSalePriceLBP(product) : product.product_PriceLBP;
    return formatLBP(price);
  }
  return 'N/A';
}

export function getStrikethroughPriceUSD(product) {
  if (product?.product_CompareAtPriceUSD != null) return product.product_CompareAtPriceUSD;
  if (hasDiscount(product) && product?.product_PriceUSD) return product.product_PriceUSD;
  return null;
}

export function getStrikethroughPriceLBP(product) {
  if (product?.product_CompareAtPriceLBP != null) return product.product_CompareAtPriceLBP;
  if (hasDiscount(product) && product?.product_PriceLBP) return product.product_PriceLBP;
  return null;
}

export function shouldShowStrikethrough(product) {
  if (product?.product_PriceUSD) {
    const strike = getStrikethroughPriceUSD(product);
    const current = getUnitPrice(product);
    return strike != null && strike > current;
  }
  if (product?.product_PriceLBP) {
    const strike = getStrikethroughPriceLBP(product);
    const current = getUnitPrice(product);
    return strike != null && strike > current;
  }
  return false;
}

export function formatStrikethroughPrice(product) {
  if (product?.product_PriceUSD) {
    const strike = getStrikethroughPriceUSD(product);
    return strike != null ? formatUSD(strike) : null;
  }
  if (product?.product_PriceLBP) {
    const strike = getStrikethroughPriceLBP(product);
    return strike != null ? formatLBP(strike) : null;
  }
  return null;
}

export function formatOriginalProductPrice(product) {
  return formatStrikethroughPrice(product);
}

export function getLowStockThreshold(product) {
  return product?.product_LowStockThreshold > 0 ? product.product_LowStockThreshold : 5;
}

export function isLowStock(product) {
  if (!product) return false;
  const threshold = getLowStockThreshold(product);
  return product.product_Stock > 0 && product.product_Stock <= threshold;
}

export function formatWhatsAppNumber(phone) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('961')) return digits;
  if (digits.startsWith('0')) return `961${digits.slice(1)}`;
  if (digits.length <= 8) return `961${digits}`;
  return digits;
}
