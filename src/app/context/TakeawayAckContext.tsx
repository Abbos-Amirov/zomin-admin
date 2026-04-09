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

  return {
    orderId,
    customerName: String(order?.customerName ?? order?.customer_name ?? "").trim(),
    customerPhone: String(order?.customerPhone ?? order?.customer_phone ?? "").trim(),
    arrivalInMinutes,
    createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
    memberKey: memberGroupKey(order),
    products: extractProductsFromOrder(order, resolveImageUrl),
  };
}

const POLL_MS = 10_000;

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
};

const TakeawayAckContext = createContext<TakeawayAckContextValue | null>(null);

export function TakeawayAckProvider({ children }: PropsWithChildren) {
  const [orders, setOrders] = useState<TakeoutOrderView[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingAckIds, setPendingAckIds] = useState<Set<string>>(() => new Set());
  const [takeawayAlertOpen, setTakeawayAlertOpen] = useState(false);
  const [takeawayAlertOrders, setTakeawayAlertOrders] = useState<TakeoutOrderView[]>([]);

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
