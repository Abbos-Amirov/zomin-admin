import type { PaidOrderSummary } from "../types/order";

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function unwrapPayload(raw: unknown): Record<string, unknown> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const r = raw as Record<string, unknown>;
  const nested = r.data ?? r.result ?? r.payload ?? r.summary;
  if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return r;
}

/**
 * GET /admin/order/paid/summary — backend turli maydon nomlarini qo‘llab-quvvatlaydi
 */
export function normalizePaidOrderSummaryFromApi(raw: unknown): PaidOrderSummary {
  const empty: PaidOrderSummary = {
    totalSum: 0,
    yearSum: 0,
    monthSum: 0,
    weekSum: 0,
    todaySum: 0,
  };
  if (raw == null) return empty;

  let o = unwrapPayload(raw);
  const nested = o.periods ?? o.revenue ?? o.byPeriod;
  if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
    o = { ...o, ...(nested as Record<string, unknown>) };
  }

  /** Backend: { orderTotalSum, orderCount, success, paymentStatus } */
  const totalSum = num(
    o.orderTotalSum ??
      o.order_total_sum ??
      o.totalSum ??
      o.total_sum ??
      o.total ??
      o.grandTotal ??
      o.grand_total ??
      o.umumiy ??
      o.all ??
      o.paidTotal
  );

  const yearSum = num(
    o.yearSum ??
      o.year_sum ??
      o.lastYear ??
      o.last_year ??
      o.oneYear ??
      o.year ??
      o.yearly
  );

  const monthSum = num(
    o.monthSum ??
      o.month_sum ??
      o.lastMonth ??
      o.last_month ??
      o.monthly ??
      o.month
  );

  const weekSum = num(
    o.weekSum ?? o.week_sum ?? o.lastWeek ?? o.last_week ?? o.weekly ?? o.week
  );

  const todaySum = num(
    o.todaySum ??
      o.today_sum ??
      o.todayOrderTotalSum ??
      o.today_order_total_sum ??
      o.daySum ??
      o.day_sum ??
      o.today ??
      o.day ??
      o.daily
  );

  return {
    totalSum: totalSum || 0,
    yearSum: yearSum || 0,
    monthSum: monthSum || 0,
    weekSum: weekSum || 0,
    todaySum: todaySum || 0,
  };
}
