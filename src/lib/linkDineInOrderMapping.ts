import {
  extractProductsFromOrder,
  type ProductLine,
} from "./utils/extractOrderProducts";

/** `/admin/order/link/dine-in` — mijoz + taomlar */
export type LinkDineInOrderView = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  memberId?: string | null;
  arrivalInMinutes: number | null;
  createdAt: string;
  tableNumber?: string;
  products: ProductLine[];
};

export function mapLinkDineInRow(
  order: any,
  resolveImageUrl: (path?: string | null) => string
): LinkDineInOrderView | null {
  const orderStatus = String(order?.orderStatus ?? order?.order_status ?? "").toUpperCase();
  if (orderStatus === "CANCELLED" || orderStatus === "CANCELED") {
    return null;
  }
  const orderId = String(order?._id ?? order?.id ?? "").trim();
  if (!orderId) return null;

  const rawMin = order?.arrivalInMinutes ?? order?.arrival_in_minutes;
  let arrivalInMinutes: number | null = null;
  if (rawMin != null && rawMin !== "") {
    const n = Number(rawMin);
    arrivalInMinutes = Number.isFinite(n) ? n : null;
  }

  const memberIdRaw =
    order?.memberId ?? order?.member_id ?? order?.member?._id ?? order?.member?.id;
  const memberIdStr =
    memberIdRaw != null && String(memberIdRaw).trim() !== ""
      ? String(memberIdRaw).trim()
      : undefined;

  return {
    orderId,
    customerName: String(order?.customerName ?? order?.customer_name ?? "").trim(),
    customerPhone: String(order?.customerPhone ?? order?.customer_phone ?? "").trim(),
    memberId: memberIdStr,
    arrivalInMinutes,
    createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
    tableNumber: String(order?.tableNumber ?? order?.table_number ?? "").trim() || undefined,
    products: extractProductsFromOrder(order, resolveImageUrl),
  };
}
