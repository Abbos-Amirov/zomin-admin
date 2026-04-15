import type {
  OrderStatis,
  OrdersByCategory,
  TodayIncomeAndAOV,
  TopSellingItems,
} from "../types/order";

/** API `{ data: { ... } }` yoki `snake_case` maydonlarni bir xil shaklga keltiradi */
function unwrapStatisPayload(raw: unknown): Record<string, unknown> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const r = raw as Record<string, unknown>;
  const candidates = [r.data, r.result, r.payload].filter(
    (x) => x != null && typeof x === "object" && !Array.isArray(x)
  ) as Record<string, unknown>[];
  for (const c of candidates) {
    if (
      Array.isArray(c.topSellingItems) ||
      Array.isArray(c.top_selling_items) ||
      Array.isArray(c.ordersByCategory) ||
      Array.isArray(c.orders_by_category) ||
      typeof c.totalOrder === "number" ||
      typeof c.total_order === "number"
    ) {
      return c;
    }
  }
  return r;
}

function mapTopItem(row: unknown): TopSellingItems {
  const x = row as Record<string, unknown>;
  return {
    productId: String(x.productId ?? x.product_id ?? ""),
    productName: String(x.productName ?? x.product_name ?? x.name ?? ""),
    totalQuantity: Number(x.totalQuantity ?? x.total_quantity ?? x.quantity ?? 0) || 0,
  };
}

function mapCategoryRow(row: unknown): OrdersByCategory {
  const x = row as Record<string, unknown>;
  const col = String(x.collection ?? x.category ?? x.type ?? "OTHER").trim();
  return {
    collection: col ? col.toUpperCase() : "OTHER",
    totalQuantity: Number(x.totalQuantity ?? x.total_quantity ?? 0) || 0,
    revenue: Number(x.revenue ?? 0) || 0,
    orders: Number(x.orders ?? x.orderCount ?? x.order_count ?? 0) || 0,
  };
}

function mapAovRow(row: unknown): TodayIncomeAndAOV {
  const x = row as Record<string, unknown>;
  return {
    totalSum: Number(x.totalSum ?? x.total_sum ?? 0) || 0,
    deliverySum: Number(x.deliverySum ?? x.delivery_sum ?? 0) || 0,
    aovGross: Number(x.aovGross ?? x.aov_gross ?? 0) || 0,
  };
}

export function normalizeOrderStatisFromApi(raw: unknown): OrderStatis {
  const o = unwrapStatisPayload(raw);

  const topRaw = o.topSellingItems ?? o.top_selling_items;
  const topSellingItems: TopSellingItems[] = Array.isArray(topRaw) ? topRaw.map(mapTopItem) : [];

  const catRaw = o.ordersByCategory ?? o.orders_by_category;
  const ordersByCategory: OrdersByCategory[] = Array.isArray(catRaw) ? catRaw.map(mapCategoryRow) : [];

  let aovRaw: unknown = o.todayIncomeAndAOV ?? o.today_income_and_aov;
  if (aovRaw != null && !Array.isArray(aovRaw) && typeof aovRaw === "object") {
    aovRaw = [aovRaw];
  }
  const todayIncomeAndAOV: TodayIncomeAndAOV[] = Array.isArray(aovRaw)
    ? aovRaw.map(mapAovRow)
    : [];

  return {
    totalOrder: Number(o.totalOrder ?? o.total_order ?? 0) || 0,
    pendingOrder: Number(o.pendingOrder ?? o.pending_order ?? 0) || 0,
    complatedOrder:
      Number(o.complatedOrder ?? o.completedOrder ?? o.completed_order ?? 0) || 0,
    todayIncomeAndAOV,
    ordersByCategory,
    topSellingItems,
  };
}
