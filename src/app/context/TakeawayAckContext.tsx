import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import OrderService from "../../services/Order.service";
import { serverApi } from "../../lib/config";
import {
  extractProductsFromOrder,
  type ProductLine,
} from "../../lib/utils/extractOrderProducts";
import { playNotificationSound } from "../../lib/utils/playNotificationSound";

export type TakeoutOrderView = {
  orderId: string;
  /** Backend member id — purge-by-member uchun */
  memberId: string | null;
  customerName: string;
  customerPhone: string;
  arrivalInMinutes: number | null;
  createdAt: string;
  memberKey: string;
  products: ProductLine[];
};

function memberGroupKey(order: any): string {
  const mid = String(
    order?.memberId ?? order?.member_id ?? order?.member?._id ?? order?.member?.id ?? ""
  ).trim();
  if (mid) return `m:${mid}`;
  const phone = String(order?.customerPhone ?? order?.customer_phone ?? "").trim();
  if (phone) return `p:${phone}`;
  const name = String(order?.customerName ?? order?.customer_name ?? "").trim();
  if (name) return `n:${name}`;
  return `o:${String(order?._id ?? order?.id ?? "")}`;
}

function mapTakeoutRow(
  order: any,
  resolveImageUrl: (path?: string | null) => string
): TakeoutOrderView | null {
  const orderStatus = String(order?.orderStatus ?? order?.order_status ?? "").toUpperCase();
  if (orderStatus === "COMPLETED" || orderStatus === "CANCELLED" || orderStatus === "CANCELED") {
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

  const memberIdStr = String(
    order?.memberId ?? order?.member_id ?? order?.member?._id ?? order?.member?.id ?? ""
  ).trim();

  return {
    orderId,
    memberId: memberIdStr || null,
    customerName: String(order?.customerName ?? order?.customer_name ?? "").trim(),
    customerPhone: String(order?.customerPhone ?? order?.customer_phone ?? "").trim(),
    arrivalInMinutes,
    createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
    memberKey: memberGroupKey(order),
    products: extractProductsFromOrder(order, resolveImageUrl),
  };
}

const POLL_MS = 10_000;
const LS_TAKEAWAY_SALES_OFFSET = "takeaway_dashboard_sales_offset";
const LS_TAKEAWAY_PAID_MEMBER_SIG = "takeaway_member_box_paid_sigs";

function loadSalesOffset(): number {
  try {
    const raw = localStorage.getItem(LS_TAKEAWAY_SALES_OFFSET);
    if (raw == null || raw === "") return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function loadPaidMemberSigs(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_TAKEAWAY_PAID_MEMBER_SIG);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    return typeof p === "object" && p !== null && !Array.isArray(p) ? (p as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function memberOrdersSignature(orders: TakeoutOrderView[]): string {
  return orders.map((o) => o.orderId).sort().join("|");
}

type TakeawayAckContextValue = {
  orders: TakeoutOrderView[];
  loading: boolean;
  refreshTakeaway: () => void;
  /** Qabul qilinishi kutilayotgan buyurtmalar soni — sidebar badge */
  pendingAckCount: number;
  isOrderPendingAck: (orderId: string) => boolean;
  acknowledgeOrder: (orderId: string) => void;
  takeawayAlertOpen: boolean;
  setTakeawayAlertOpen: (open: boolean) => void;
  takeawayAlertOrders: TakeoutOrderView[];
  /** «To'landi» bosilganda qo‘shilgan summalar — Umumiy savdoga */
  takeawaySalesOffset: number;
  /** Mijoz qutisi yashirinadimi (shu buyurtma to‘plami bo‘yicha) */
  isMemberBoxPaid: (memberKey: string, memberOrders: TakeoutOrderView[]) => boolean;
  markMemberBoxPaid: (
    memberKey: string,
    memberOrders: TakeoutOrderView[],
    totalAmount: number
  ) => void | Promise<void>;
};

const TakeawayAckContext = createContext<TakeawayAckContextValue | null>(null);

export function TakeawayAckProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<TakeoutOrderView[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingAckIds, setPendingAckIds] = useState<Set<string>>(() => new Set());
  const [takeawayAlertOpen, setTakeawayAlertOpen] = useState(false);
  const [takeawayAlertOrders, setTakeawayAlertOrders] = useState<TakeoutOrderView[]>([]);
  const [takeawaySalesOffset, setTakeawaySalesOffset] = useState(loadSalesOffset);
  const [paidMemberBoxSigs, setPaidMemberBoxSigs] = useState<Record<string, string>>(loadPaidMemberSigs);

  const isFirstFetchRef = useRef(true);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  const resolveImageUrl = useCallback((path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = serverApi.endsWith("/") ? serverApi.slice(0, -1) : serverApi;
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }, []);

  const fetchTakeaway = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const orderSvc = new OrderService();
        const rows = await orderSvc.getLinkTakeoutOrders();
        const list: TakeoutOrderView[] = [];
        for (const row of rows) {
          const v = mapTakeoutRow(row, resolveImageUrl);
          if (v) list.push(v);
        }
        list.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
        });
        setOrders(list);

        const idsNow = new Set(list.map((o) => o.orderId));

        setPendingAckIds((prev) => {
          const next = new Set(prev);
          Array.from(prev).forEach((id) => {
            if (!idsNow.has(id)) next.delete(id);
          });
          return next;
        });

        if (isFirstFetchRef.current) {
          isFirstFetchRef.current = false;
          knownOrderIdsRef.current = idsNow;
        } else {
          const newOnes = list.filter((o) => !knownOrderIdsRef.current.has(o.orderId));
          knownOrderIdsRef.current = idsNow;
          if (newOnes.length > 0) {
            setPendingAckIds((prev) => {
              const next = new Set(prev);
              newOnes.forEach((o) => next.add(o.orderId));
              return next;
            });
            setTakeawayAlertOrders(newOnes);
            setTakeawayAlertOpen(true);
            playNotificationSound();
          }
        }
      } catch (err) {
        console.error("TakeawayAckProvider fetch error:", err);
        setOrders([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [resolveImageUrl]
  );

  useEffect(() => {
    fetchTakeaway(false);
  }, [fetchTakeaway]);

  useEffect(() => {
    const id = window.setInterval(() => fetchTakeaway(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchTakeaway]);

  const acknowledgeOrder = useCallback((orderId: string) => {
    setPendingAckIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  }, []);

  const isMemberBoxPaid = useCallback(
    (memberKey: string, memberOrders: TakeoutOrderView[]) => {
      const sig = memberOrdersSignature(memberOrders);
      return paidMemberBoxSigs[memberKey] === sig;
    },
    [paidMemberBoxSigs]
  );

  const markMemberBoxPaid = useCallback(
    async (memberKey: string, memberOrders: TakeoutOrderView[], totalAmount: number) => {
      const fromOrders = memberOrders.map((o) => o.memberId).find((id) => id && id.trim() !== "");
      const fromKey =
        memberKey.startsWith("m:") && memberKey.length > 2 ? memberKey.slice(2).trim() : "";
      const memberId = String(fromOrders ?? fromKey ?? "").trim();

      const customerPhone = String(
        memberOrders.find((o) => o.customerPhone?.trim())?.customerPhone ??
          memberOrders[0]?.customerPhone ??
          ""
      ).trim();

      const shouldCallBackend = Boolean(memberId || customerPhone);
      if (shouldCallBackend) {
        try {
          const svc = new OrderService();
          await svc.purgeByMember({
            memberId: memberId || "",
            customerPhone: customerPhone || "",
          });
        } catch (err) {
          console.error("markMemberBoxPaid purgeByMember:", err);
          return;
        }
      }

      const sig = memberOrdersSignature(memberOrders);
      setPaidMemberBoxSigs((prev) => {
        const next = { ...prev, [memberKey]: sig };
        try {
          localStorage.setItem(LS_TAKEAWAY_PAID_MEMBER_SIG, JSON.stringify(next));
        } catch {}
        return next;
      });
      const add = Number(totalAmount) || 0;
      setTakeawaySalesOffset((prev) => {
        const n = prev + add;
        try {
          localStorage.setItem(LS_TAKEAWAY_SALES_OFFSET, String(n));
        } catch {}
        return n;
      });
      setPendingAckIds((prev) => {
        const next = new Set(prev);
        memberOrders.forEach((o) => next.delete(o.orderId));
        return next;
      });
    },
    []
  );

  const isOrderPendingAck = useCallback(
    (orderId: string) => pendingAckIds.has(orderId),
    [pendingAckIds]
  );

  const refreshTakeaway = useCallback(() => fetchTakeaway(false), [fetchTakeaway]);

  const value = useMemo<TakeawayAckContextValue>(
    () => ({
      orders,
      loading,
      refreshTakeaway,
      pendingAckCount: pendingAckIds.size,
      isOrderPendingAck,
      acknowledgeOrder,
      takeawayAlertOpen,
      setTakeawayAlertOpen,
      takeawayAlertOrders,
      takeawaySalesOffset,
      isMemberBoxPaid,
      markMemberBoxPaid,
    }),
    [
      orders,
      loading,
      refreshTakeaway,
      pendingAckIds,
      isOrderPendingAck,
      acknowledgeOrder,
      takeawayAlertOpen,
      takeawayAlertOrders,
      takeawaySalesOffset,
      isMemberBoxPaid,
      markMemberBoxPaid,
    ]
  );

  return <TakeawayAckContext.Provider value={value}>{children}</TakeawayAckContext.Provider>;
}

export function useTakeawayAck(): TakeawayAckContextValue {
  const ctx = useContext(TakeawayAckContext);
  if (!ctx) {
    throw new Error("useTakeawayAck must be used within TakeawayAckProvider");
  }
  return ctx;
}

/** Sidebar kabi joylarda provider bo‘lmasa (test) */
export function useTakeawayAckOptional(): TakeawayAckContextValue | null {
  return useContext(TakeawayAckContext);
}
