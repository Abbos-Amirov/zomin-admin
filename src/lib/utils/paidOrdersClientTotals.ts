import type { PaidOrderSummary } from "../types/order";

function orderCreatedAtMs(v: unknown): number {
  if (v == null) return NaN;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return new Date(v).getTime();
  if (typeof v === "string") return new Date(v).getTime();
  return NaN;
}

/**
 * To‘langan buyurtmalar ro‘yxati (masalan getOrdersForStats) bo‘yicha mahalliy vaqt
 * oralig‘ida yig‘indilar — API `todaySum` / `monthSum` va hokazolarni to‘ldirish uchun.
 */
export function computePaidTotalsFromOrders(orders: unknown[]): PaidOrderSummary {
  const empty: PaidOrderSummary = {
    totalSum: 0,
    yearSum: 0,
    monthSum: 0,
    weekSum: 0,
    todaySum: 0,
  };
  if (!Array.isArray(orders) || orders.length === 0) return empty;

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const startTodayMs = startToday.getTime();
  const endTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoMs = weekAgo.getTime();

  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoMs = monthAgo.getTime();

  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const yearAgoMs = yearAgo.getTime();

  let totalSum = 0;
  let todaySum = 0;
  let weekSum = 0;
  let monthSum = 0;
  let yearSum = 0;

  for (const raw of orders) {
    const o = raw as Record<string, unknown>;
    const amt = Number(o.orderTotal ?? o.order_total ?? 0) || 0;
    const ts = orderCreatedAtMs(o.createdAt ?? o.created_at);
    if (!Number.isFinite(ts)) continue;

    totalSum += amt;
    if (ts >= startTodayMs && ts <= endTodayMs) todaySum += amt;
    if (ts >= weekAgoMs) weekSum += amt;
    if (ts >= monthAgoMs) monthSum += amt;
    if (ts >= yearAgoMs) yearSum += amt;
  }

  return { totalSum, todaySum, weekSum, monthSum, yearSum };
}

/**
 * Backend qiymati > 0 bo‘lsa ustun; 0 bo‘lsa client hisobidan to‘ldiriladi
 * (masalan faqat `orderTotalSum` kelganda bugungi alohida kelmaydi).
 */
export function mergePaidSummaryWithComputed(
  api: PaidOrderSummary | null,
  computed: PaidOrderSummary
): PaidOrderSummary {
  const pick = (key: keyof PaidOrderSummary): number => {
    const a = Number(api?.[key] ?? 0) || 0;
    const c = Number(computed[key] ?? 0) || 0;
    return a > 0 ? a : c;
  };

  return {
    totalSum: pick("totalSum"),
    yearSum: pick("yearSum"),
    monthSum: pick("monthSum"),
    weekSum: pick("weekSum"),
    todaySum: pick("todaySum"),
  };
}
