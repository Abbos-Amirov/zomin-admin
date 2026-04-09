/** Buyurtmadan taomlar qatorlari — backend turli shakllarda qaytarishi mumkin */

export type ProductLine = {
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

export function extractProductsFromOrder(
  order: any,
  resolveImageUrl: (path?: string | null) => string
): ProductLine[] {
  const orderItems = Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.order_items)
    ? order.order_items
    : Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.cart)
    ? order.cart
    : [];

  const productData = Array.isArray(order?.productData)
    ? order.productData
    : Array.isArray(order?.product_data)
    ? order.product_data
    : Array.isArray(order?.products)
    ? order.products
    : [];

  const productById = new Map<string, any>();
  productData.forEach((p: any) => {
    const pid = String(p?._id ?? p?.id ?? "").trim();
    if (pid) productById.set(pid, p);
  });

  const mapItem = (item: any): ProductLine => {
    const productId = String(
      item?.productId ?? item?.product_id ?? item?.product?._id ?? item?.product?.id ?? ""
    ).trim();
    const product = productById.get(productId) ?? item?.product ?? item ?? {};
    const images = Array.isArray(product?.productImages)
      ? product.productImages
      : Array.isArray(product?.product_images)
      ? product.product_images
      : [];
    const productImage = resolveImageUrl(images[0] ?? "");
    const quantity = Number(item?.itemQuantity ?? item?.item_quantity ?? item?.quantity ?? 0) || 0;
    const price =
      Number(item?.itemPrice ?? item?.item_price ?? product?.productPrice ?? product?.product_price ?? 0) || 0;

    return {
      productName: String(
        product?.productName ??
          product?.product_name ??
          item?.productName ??
          item?.product_name ??
          "—"
      ),
      productImage,
      quantity: quantity || 1,
      price,
    };
  };

  if (orderItems.length > 0) {
    return orderItems.map(mapItem);
  }

  if (productData.length > 0) {
    return productData.map((p: any) => {
      const images = Array.isArray(p?.productImages)
        ? p.productImages
        : Array.isArray(p?.product_images)
        ? p.product_images
        : [];
      return {
        productName: String(p?.productName ?? p?.product_name ?? "—"),
        productImage: resolveImageUrl(images[0] ?? ""),
        quantity: Number(p?.quantity ?? p?.itemQuantity ?? p?.item_quantity ?? 1) || 1,
        price: Number(p?.productPrice ?? p?.product_price ?? p?.price ?? 0) || 0,
      };
    });
  }

  const rawProducts = order?.products;
  if (Array.isArray(rawProducts) && rawProducts.length > 0) {
    return rawProducts.map((p: any) => {
      const images = Array.isArray(p?.productImages)
        ? p.productImages
        : Array.isArray(p?.product_images)
        ? p.product_images
        : [];
      return {
        productName: String(p?.productName ?? p?.product_name ?? p?.name ?? "—"),
        productImage: resolveImageUrl(images[0] ?? ""),
        quantity: Number(p?.quantity ?? 1) || 1,
        price: Number(p?.productPrice ?? p?.product_price ?? p?.price ?? 0) || 0,
      };
    });
  }

  return [];
}
