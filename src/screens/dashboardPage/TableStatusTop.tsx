import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Box,
  Divider,
  Chip,
  Badge,
  Button,
  Paper,
  Link,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { createSelector } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  retrieveLinkDineInOrders,
  retrieveLinkDinePendingAckCount,
  retrieveLinkDinePendingAckIds,
  retrieveTableStatus,
} from "./selector";
import { Table } from "../../lib/types/table";
import OrderService from "../../services/Order.service";
import { serverApi, socket } from "../../lib/config";
import { setLinkDinePendingAckIds, setTableStatus } from "./slice";
import type { LinkDineInOrderView } from "../../lib/linkDineInOrderMapping";
import { TableStatus } from "../../lib/enums/table.enum";
import TableService from "../../services/Table.service";
import "../../css/tableStatus.css";
import { OrderType } from "../../lib/enums/order.enum";
import {
  extractProductsFromOrder,
  type ProductLine,
} from "../../lib/utils/extractOrderProducts";
import { store } from "../../app/store";

/** Panel API dan kelgan buyurtma (stol) */
type PanelOrderView = {
  orderId: string;
  orderType: "TABLE" | "TAKEOUT" | "DELIVERY";
  tableId: string;
  tableNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  products: ProductLine[];
};

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "#";
  return `tel:${digits}`;
}

/** Buyurtma yaratilgan vaqtga daqiqa qo'shib, kelish soatini (HH:mm) */
function formatArrivalClock(createdAt: string, addMinutes: number): string | null {
  if (!createdAt || !Number.isFinite(addMinutes)) return null;
  const d = new Date(createdAt);
  if (!Number.isFinite(d.getTime())) return null;
  d.setMinutes(d.getMinutes() + addMinutes);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Backend `{ data: { list: [] } }` yoki `rows` kabi turli shakllarda qaytarishi mumkin */
function extractPanelRowsPayload(payload: unknown): any[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;

  const p = payload as Record<string, any>;
  const paths: string[][] = [
    ["orders"],
    ["data", "orders"],
    ["data", "list"],
    ["data", "items"],
    ["data", "results"],
    ["data", "rows"],
    ["data", "tables"],
    ["data", "data"],
    ["data", "panel"],
    ["data", "panelOrders"],
    ["result"],
    ["rows"],
    ["tables"],
    ["list"],
    ["items"],
    ["data"],
    ["content"],
    ["body"],
    ["data", "body"],
    ["data", "content"],
  ];

  for (const path of paths) {
    let cur: any = p;
    for (const key of path) {
      cur = cur?.[key];
    }
    if (Array.isArray(cur)) return cur;
  }
  return [];
}

const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

const STORAGE_KEY = "orderStatus_deliveredOrderIds";
const STORAGE_KEY_LINK_DINE = "orderStatus_linkDineInDeliveredOrderIds";
/** "To'landi" bosilgan stol yashiklari: buyurtma IDlari to'plami imzosi bilan; yangi buyurtma kelganda qayta ko'rinadi */
const STORAGE_KEY_LINK_DINE_PAID_BUNDLE = "orderStatus_linkDineInPaidBundleSigs";

function linkDineBundleSignature(orders: Pick<LinkDineInOrderView, "orderId">[]): string {
  return orders.map((o) => o.orderId).sort().join("|");
}

const parsePaidBundleSigs = (): Record<string, string> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_LINK_DINE_PAID_BUNDLE);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    return typeof p === "object" && p !== null && !Array.isArray(p) ? (p as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const parseLinkDineDelivered = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_LINK_DINE);
    if (!raw) return new Set();
    const parsed: string[] = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveLinkDineDelivered = (ids: Set<string>) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_LINK_DINE, JSON.stringify(Array.from(ids)));
  } catch {}
};

const parseStored = (): Record<string, Set<string>> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: Record<string, string[]> = JSON.parse(raw);
    const result: Record<string, Set<string>> = {};
    for (const [table, ids] of Object.entries(parsed)) {
      result[table] = new Set(Array.isArray(ids) ? ids : []);
    }
    return result;
  } catch {
    return {};
  }
};

const saveStored = (data: Record<string, Set<string>>) => {
  try {
    const toSave: Record<string, string[]> = {};
    for (const [table, set] of Object.entries(data)) {
      toSave[table] = Array.from(set);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
};

export default function TableStatusTop() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tableStatus } = useSelector(tableStatusRetriever);
  const [groupedOrders, setGroupedOrders] = useState<Record<string, PanelOrderView[]>>({});
  const linkDineInOrders = useSelector(retrieveLinkDineInOrders);
  const [loading, setLoading] = useState<boolean>(false);
  /** Berildi bosilganda o'sha paytda mavjud bo'lgan order ID lar; sessionStorage da saqlanadi */
  const [deliveredOrderIds, setDeliveredOrderIds] = useState<Record<string, Set<string>>>(parseStored);
  /** Link orqali o'tirib yeyish: berildi belgilangan buyurtma IDlari */
  const [linkDineInDeliveredIds, setLinkDineInDeliveredIds] = useState<Set<string>>(parseLinkDineDelivered);
  /** Saboydagi kabi: qabul qilinishi kutilayotgan link dine-in buyurtma IDlari (Redux — sidebar/topbar badge) */
  const linkDinePendingAckIds = useSelector(retrieveLinkDinePendingAckIds);
  const linkDinePendingAckSet = useMemo(() => new Set(linkDinePendingAckIds), [linkDinePendingAckIds]);
  /** Stol yashigi "To'landi" — joriy buyurtmalar imzosi bilan yashirinadi */
  const [linkDinePaidBundleSigs, setLinkDinePaidBundleSigs] =
    useState<Record<string, string>>(parsePaidBundleSigs);

  const resolveImageUrl = useCallback((path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = serverApi.endsWith("/") ? serverApi.slice(0, -1) : serverApi;
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }, []);

  /** Faqat «Oshxonaga tashrif — stol buyurtmalari»: GET /admin/orders/all/panel */
  const fetchPanelOrders = useCallback(async (): Promise<void> => {
    try {
      const base = String(serverApi).replace(/\/+$/, "");
      const panelUrl = `${base}/admin/orders/all/panel`;
      const { data: payload } = await axios.get(panelUrl, {
        withCredentials: true,
      });
      const panelRows: any[] = extractPanelRowsPayload(payload);

      const grouped: Record<string, PanelOrderView[]> = {};

      const tableNumFrom = (order: any, row: any): string =>
        String(
          order?.tableNumber ??
            order?.table_number ??
            order?.table?.tableNumber ??
            order?.table?.table_number ??
            order?.table?.number ??
            row?.tableNumber ??
            row?.table_number ??
            row?.number ??
            row?.table?.tableNumber ??
            row?.table?.table_number ??
            row?.table?.number ??
            ""
        ).trim();

      const mapOrderToView = (order: any, row?: any): PanelOrderView | null => {
        const orderTypeRaw = String(order?.orderType ?? order?.order_type ?? "").toUpperCase();
        const orderStatus = String(order?.orderStatus ?? order?.order_status ?? "").toUpperCase();
        if (orderStatus === "CANCELLED" || orderStatus === "CANCELED") return null;

        const normalizedType: "TABLE" | "TAKEOUT" | "DELIVERY" =
          orderTypeRaw === OrderType.TAKEOUT
            ? "TAKEOUT"
            : orderTypeRaw === OrderType.DELIVERY
            ? "DELIVERY"
            : "TABLE";

        const products = extractProductsFromOrder(order, resolveImageUrl);

        const tableNumberStr = row
          ? tableNumFrom(order, row)
          : String(
              order?.tableNumber ??
                order?.table_number ??
                order?.table?.tableNumber ??
                order?.table?.table_number ??
                order?.table?.number ??
                ""
            ).trim();

        return {
          orderId: String(order?._id ?? order?.id ?? ""),
          orderType: normalizedType,
          tableId: String(order?.tableId ?? order?.table_id ?? order?.table?._id ?? ""),
          tableNumber: tableNumberStr,
          orderStatus: String(order?.orderStatus ?? order?.order_status ?? ""),
          paymentStatus: String(order?.paymentStatus ?? order?.payment_status ?? ""),
          paymentMethod: String(order?.paymentMethod ?? order?.payment_method ?? ""),
          createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
          products,
        };
      };

      /** Stol raqami bo‘lmasa DELIVERY ni memberId bo‘yicha yig‘ish */
      const groupKeyForPanel = (order: any, row: any, orderView: PanelOrderView): string => {
        const tn = tableNumFrom(order, row);
        if (tn) return tn;
        if (orderView.orderType === "DELIVERY") {
          const mid = String(order?.memberId ?? order?.member_id ?? "").trim();
          return mid ? `D:${mid}` : "yetkazib";
        }
        return "";
      };

      panelRows.forEach((row: any) => {
        const nestedOrders = Array.isArray(row?.orders)
          ? row.orders
          : Array.isArray(row?.orderList)
          ? row.orderList
          : Array.isArray(row?.items)
          ? row.items
          : Array.isArray(row?.data?.orders)
          ? row.data.orders
          : Array.isArray(row?.table?.orders)
          ? row.table.orders
          : Array.isArray(row?.activeOrders)
          ? row.activeOrders
          : null;

        if (nestedOrders) {
          nestedOrders.forEach((order: any) => {
            const orderView = mapOrderToView(
              {
                ...order,
                tableNumber:
                  order?.tableNumber ??
                  order?.table_number ??
                  row?.tableNumber ??
                  row?.table_number ??
                  row?.table?.tableNumber,
              },
              row
            );
            if (!orderView) return;
            if (orderView.orderType === "TAKEOUT") return;
            const key = groupKeyForPanel(order, row, orderView);
            if (!key) return;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(orderView);
          });
          return;
        }

        if (row?.order && typeof row.order === "object" && !Array.isArray(row.order)) {
          const order = row.order;
          const orderView = mapOrderToView(order, row);
          if (!orderView) return;
          if (orderView.orderType === "TAKEOUT") return;
          const key = groupKeyForPanel(order, row, orderView);
          if (!key) return;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(orderView);
          return;
        }

        const orderView = mapOrderToView(row);
        if (!orderView) return;
        if (orderView.orderType === "TAKEOUT") return;
        const key = groupKeyForPanel(row, row, orderView);
        if (!key) return;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(orderView);
      });

      setGroupedOrders(grouped);
    } catch (err) {
      console.error("fetchPanelOrders:", err);
      setGroupedOrders({});
    }
  }, [resolveImageUrl]);

  /** Link dine-in ro'yxati — `LinkDineInGlobalSync` (barcha layoutda) */
  const refreshOrdersData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await fetchPanelOrders();
    } finally {
      if (!silent) setLoading(false);
    }
  }, [fetchPanelOrders]);

  useEffect(() => {
    refreshOrdersData();
  }, [refreshOrdersData]);

  useEffect(() => {
    saveStored(deliveredOrderIds);
  }, [deliveredOrderIds]);

  useEffect(() => {
    saveLinkDineDelivered(linkDineInDeliveredIds);
  }, [linkDineInDeliveredIds]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_LINK_DINE_PAID_BUNDLE, JSON.stringify(linkDinePaidBundleSigs));
    } catch {}
  }, [linkDinePaidBundleSigs]);

  useEffect(() => {
    const refreshBySocket = () => {
      // faqat order oqimi bo'yicha yangilash
      refreshOrdersData(true);
    };
    const refreshByAnyOrderEvent = (eventName: string) => {
      if (String(eventName).toLowerCase().includes("order")) {
        refreshOrdersData(true);
      }
    };

    socket.on("newOrder", refreshBySocket);
    socket.on("orderCreated", refreshBySocket);
    socket.on("orderUpdated", refreshBySocket);
    socket.on("order", refreshBySocket);
    socket.onAny(refreshByAnyOrderEvent);

    return () => {
      socket.off("newOrder", refreshBySocket);
      socket.off("orderCreated", refreshBySocket);
      socket.off("orderUpdated", refreshBySocket);
      socket.off("order", refreshBySocket);
      socket.offAny(refreshByAnyOrderEvent);
    };
  }, [refreshOrdersData]);

  useEffect(() => {
    // Socket uzilib qolsa ham list eskirib qolmasligi uchun fallback
    const id = window.setInterval(() => {
      refreshOrdersData(true);
    }, 10_000);

    return () => window.clearInterval(id);
  }, [refreshOrdersData]);

  const linkDinePendingAckCount = useSelector(retrieveLinkDinePendingAckCount);

  const tableNumbers = useMemo(() => {
    const fromOrders = Object.keys(groupedOrders);
    const unique = Array.from(new Set(fromOrders)).filter(Boolean);
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [groupedOrders]);

  /** Har bir stol uchun bitta "yashik": shu stolga tegishli barcha link buyurtmalar */
  const linkDineInByTable = useMemo(() => {
    const byTable: Record<string, LinkDineInOrderView[]> = {};
    for (const o of linkDineInOrders) {
      const k = o.tableNumber?.trim() ? o.tableNumber.trim() : "__none__";
      if (!byTable[k]) byTable[k] = [];
      byTable[k].push(o);
    }
    const keys = Object.keys(byTable).sort((a, b) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      const na = Number(a);
      const nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    return { byTable, keys };
  }, [linkDineInOrders]);

  /** "To'landi" bilan yopilgan yoki yo'q qilinadigan stollar (imzo mos kelmasa — yangi buyurtma, qayta ko'rsatiladi) */
  const linkDineInVisibleTableKeys = useMemo(() => {
    return linkDineInByTable.keys.filter((k) => {
      const orders = linkDineInByTable.byTable[k] ?? [];
      const sig = linkDineBundleSignature(orders);
      return linkDinePaidBundleSigs[k] !== sig;
    });
  }, [linkDineInByTable, linkDinePaidBundleSigs]);

  const handleLinkDineBoxPaid = useCallback(
    async (tableKey: string, orders: LinkDineInOrderView[], e: React.MouseEvent) => {
      e.stopPropagation();
      const memberId = String(
        orders.map((o) => o.memberId).find((id) => id && String(id).trim() !== "") ?? ""
      ).trim();
      const customerPhone = String(
        orders.find((o) => o.customerPhone?.trim())?.customerPhone ?? orders[0]?.customerPhone ?? ""
      ).trim();

      if (memberId || customerPhone) {
        try {
          const orderSvc = new OrderService();
          await orderSvc.purgeByMember({
            memberId: memberId || "",
            customerPhone: customerPhone || "",
          });
        } catch (err) {
          console.error("handleLinkDineBoxPaid purgeByMember:", err);
          return;
        }
      }

      /** Band (OCCUPIED) → tozalanmoqda (CLEANING). 3 daqiqadan keyin `TableStatus.tsx` mavjud (AVAILABLE) qiladi */
      const tnForTable =
        tableKey !== "__none__"
          ? String(tableKey).trim()
          : String(orders.find((o) => o.tableNumber?.trim())?.tableNumber ?? "").trim();
      if (tnForTable) {
        const currentTables = Array.isArray(tableStatus) ? (tableStatus as Table[]) : [];
        const t = currentTables.find((tab) => String(tab.tableNumber) === String(tnForTable));
        if (t?._id && t.tableStatus === TableStatus.OCCUPIED) {
          const nowIso = new Date().toISOString();
          const nextTables = currentTables.map((tab) =>
            tab._id === t._id ? { ...tab, tableStatus: TableStatus.CLEANING, updatedAt: nowIso } : tab
          );
          dispatch(setTableStatus(nextTables));
          try {
            const tableSvc = new TableService();
            await tableSvc.updateChosenTable({
              _id: t._id,
              tableStatus: TableStatus.CLEANING,
            });
          } catch (err) {
            console.error("handleLinkDineBoxPaid updateChosenTable:", err);
          }
        }
      }

      const sig = linkDineBundleSignature(orders);
      setLinkDinePaidBundleSigs((prev) => ({ ...prev, [tableKey]: sig }));
      const remove = new Set(orders.map((o) => o.orderId));
      const prevAck = store.getState().dashboardPage.linkDinePendingAckIds ?? [];
      dispatch(setLinkDinePendingAckIds(prevAck.filter((id) => !remove.has(id))));
    },
    [dispatch, tableStatus]
  );

  const handleCompleteTableOrders = useCallback(
    async (tableNumber: string) => {
      const orders = groupedOrders[tableNumber] ?? [];
      const fromOrder = orders.find((o) => o.tableId)?.tableId;
      const fromStore = (Array.isArray(tableStatus) ? tableStatus : []).find(
        (t: Table) => String(t.tableNumber) === String(tableNumber)
      )?._id;
      const tableId = fromOrder || fromStore;
      if (!tableId) return;

      try {
        const orderSvc = new OrderService();
        await orderSvc.purgeByTable(tableId);

        // Stol holatini "tozalanmoqda"ga o‘tkazamiz (UIda darhol ko‘rinsin)
        const currentTables = Array.isArray(tableStatus) ? (tableStatus as Table[]) : [];
        if (currentTables.length > 0) {
          const nowIso = new Date().toISOString();
          const nextTables = currentTables.map((t) =>
            t._id === tableId
              ? { ...t, tableStatus: TableStatus.CLEANING, updatedAt: nowIso }
              : t
          );
          dispatch(setTableStatus(nextTables));
        }

        // Backend table status ham sync bo‘lsin
        const tableSvc = new TableService();
        await tableSvc.updateChosenTable({
          _id: tableId,
          tableStatus: TableStatus.CLEANING,
        });

        // Bu paneldan yo‘qolsin va delivered ro‘yxatdan o‘chirish
        setDeliveredOrderIds((prev) => {
          const next = { ...prev };
          delete next[String(tableNumber)];
          return next;
        });
        refreshOrdersData(true);
      } catch (err) {
        console.error("handleCompleteTableOrders error:", err);
      }
    },
    [dispatch, refreshOrdersData, groupedOrders, tableStatus]
  );

  const handleDelivered = useCallback((tableNumber: string, orders: { orderId: string }[], e: React.MouseEvent) => {
    e.stopPropagation();
    const ids = new Set(orders.map((o) => o.orderId));
    setDeliveredOrderIds((prev) => ({ ...prev, [String(tableNumber)]: ids }));
  }, []);

  const handleLinkDineBerildi = useCallback((o: LinkDineInOrderView, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkDineInDeliveredIds((prev) => {
      const next = new Set(prev);
      next.add(o.orderId);
      return next;
    });
  }, []);

  const handleLinkDineAcknowledge = useCallback((orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prevAck = store.getState().dashboardPage.linkDinePendingAckIds ?? [];
    dispatch(setLinkDinePendingAckIds(prevAck.filter((id) => id !== orderId)));
  }, [dispatch]);

  return (
    <Card className="table-status-card table-status-top-card">
      <CardContent sx={{ width: "100%", padding: "12px 16px" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h5" className="table-status-top-title">
            {t("dashboard.ordersPanel")}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/orders-panel/all")}
          >
            {t("dashboard.detail")}
          </Button>
        </Stack>

        <Paper
          elevation={0}
          className="link-orders-split-panel"
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {t("dashboard.linkOrdersTitle")}
          </Typography>
          <Box
            className="link-dine-in-column"
            sx={{
              p: 2,
              borderRadius: 2,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(145deg, rgba(25,118,210,0.12) 0%, rgba(0,0,0,0.2) 100%)"
                  : "linear-gradient(145deg, rgba(25,118,210,0.08) 0%, rgba(255,255,255,0.95) 100%)",
              border: "1px solid",
              borderColor: "primary.light",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(0,0,0,0.35)"
                  : "0 8px 28px rgba(25, 118, 210, 0.12)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Badge
                badgeContent={linkDinePendingAckCount > 0 ? linkDinePendingAckCount : undefined}
                color="error"
                max={99}
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <Box component="span" sx={{ display: "inline-flex" }}>
                  <TableRestaurantIcon color="primary" sx={{ fontSize: 28 }} />
                </Box>
              </Badge>
              <Typography variant="subtitle1" color="primary.main" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
                {t("dashboard.dineInOrdersTitle")}
              </Typography>
            </Stack>
            {linkDineInOrders.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.noDineInFromLink")}
              </Typography>
            ) : linkDineInVisibleTableKeys.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.linkDineInAllPaidDismissed")}
              </Typography>
            ) : (
              <Grid
                container
                spacing={2.5}
                alignItems="stretch"
                sx={{
                  maxHeight: { xs: "min(85vh, 780px)", sm: "min(75vh, 820px)" },
                  overflow: "auto",
                  pr: 0.5,
                }}
              >
                {linkDineInVisibleTableKeys.map((tableKey) => {
                  const orders = linkDineInByTable.byTable[tableKey] ?? [];
                  const tableLabel =
                    tableKey === "__none__" ? t("dashboard.linkDineInNoTable") : tableKey;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={`link-bundle-${tableKey}`}>
                    <Paper
                      elevation={3}
                      className="link-dine-in-table-bundle"
                      sx={{
                        p: 2,
                        height: "100%",
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: "primary.main",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(0,0,0,0.25)" : "background.paper",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={1}
                        sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: "divider" }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Typography variant="h5" fontWeight={900} color="primary.main">
                            {t("dashboard.linkDineInStolWord")} {tableLabel}
                          </Typography>
                          <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={t("dashboard.linkDineInBundleCount", { count: orders.length })}
                          />
                        </Stack>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => handleLinkDineBoxPaid(tableKey, orders, e)}
                          sx={{ fontWeight: 800 }}
                        >
                          {t("dashboard.paid")}
                        </Button>
                      </Stack>
                      <Grid container spacing={2} alignItems="stretch">
                        {orders.map((o) => {
                          const lineTotal = o.products.reduce((s, p) => s + p.quantity * p.price, 0);
                          const arrivalClock =
                            o.arrivalInMinutes != null
                              ? formatArrivalClock(o.createdAt, o.arrivalInMinutes)
                              : null;
                          const isDelivered = linkDineInDeliveredIds.has(o.orderId);
                          const pendingAck = linkDinePendingAckSet.has(o.orderId);
                          return (
                            <Grid item xs={12} key={`link-dine-${o.orderId}`}>
                            <Paper
                              elevation={isDelivered ? 0 : 2}
                              className={`link-dine-in-card${isDelivered ? " link-dine-in-card--delivered" : ""}`}
                              sx={{
                                p: 2,
                                height: "100%",
                                cursor: "pointer",
                                borderRadius: 2,
                                border: "2px solid",
                                borderColor: isDelivered ? "warning.main" : "divider",
                                bgcolor: isDelivered ? "rgba(237, 152, 33, 0.12)" : "action.hover",
                                transition: "box-shadow 0.2s, border-color 0.2s",
                                "&:hover": {
                                  borderColor: isDelivered ? "warning.dark" : "primary.main",
                                  boxShadow: 3,
                                },
                              }}
                              onClick={() => navigate(`/orders/${o.orderId}`)}
                            >
                              <Stack spacing={1.25}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  flexWrap="wrap"
                                  gap={1}
                                >
                                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                                    {t("dashboard.linkDineInOrderShort")} · …{o.orderId.slice(-6)}
                                  </Typography>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    onClick={(e) => handleLinkDineBerildi(o, e)}
                                    sx={{ fontWeight: 800, px: 1.5 }}
                                  >
                                    {t("dashboard.delivered")}
                                  </Button>
                                </Stack>

                                {o.createdAt ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(o.createdAt).toLocaleString()}
                                  </Typography>
                                ) : null}

                                {o.customerName ? (
                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {o.customerName}
                                    </Typography>
                                  </Stack>
                                ) : null}

                                {o.customerPhone ? (
                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Link
                                      component="a"
                                      href={telHref(o.customerPhone)}
                                      onClick={(e) => e.stopPropagation()}
                                      underline="hover"
                                      color="primary"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {o.customerPhone}
                                    </Link>
                                  </Stack>
                                ) : null}

                                {o.arrivalInMinutes != null ? (
                                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                                    <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Typography variant="body2" component="div">
                                      {t("dashboard.arrivalInMinutes", { min: o.arrivalInMinutes })}
                                      {arrivalClock ? (
                                        <Box
                                          component="span"
                                          sx={{ fontWeight: 700, ml: 0.75, whiteSpace: "nowrap" }}
                                        >
                                          · {arrivalClock}
                                        </Box>
                                      ) : null}
                                    </Typography>
                                  </Stack>
                                ) : null}

                                <Divider flexItem />

                                {o.products.length === 0 ? (
                                  <Typography variant="body2" color="warning.main" fontWeight={600}>
                                    {t("dashboard.noProductsInOrder")}
                                  </Typography>
                                ) : (
                                  <Stack spacing={0.75}>
                                    {o.products.map((p, idx) => (
                                      <Stack
                                        key={`${o.orderId}-p-${idx}`}
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                          sx={{ minWidth: 0, flex: 1 }}
                                        >
                                          <Box
                                            component="img"
                                            src={
                                              p.productImage ||
                                              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                                            }
                                            alt=""
                                            sx={{
                                              width: 32,
                                              height: 32,
                                              borderRadius: 0.75,
                                              objectFit: "cover",
                                              bgcolor: "rgba(0,0,0,0.04)",
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Typography variant="body2" sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                                            {p.productName}
                                          </Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={600}>
                                          ×{p.quantity} · {p.quantity * p.price}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                )}

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="caption" color="text.secondary">
                                    ID …{o.orderId.slice(-6)}
                                  </Typography>
                                  <Typography fontWeight={700}>{lineTotal}</Typography>
                                </Stack>

                                <Button
                                  fullWidth
                                  size="small"
                                  variant={pendingAck ? "contained" : "outlined"}
                                  color={pendingAck ? "warning" : "success"}
                                  sx={{ fontWeight: 800, mt: 0.5 }}
                                  disabled={!pendingAck}
                                  onClick={(e) => handleLinkDineAcknowledge(o.orderId, e)}
                                >
                                  {pendingAck
                                    ? t("dashboard.takeawayAcknowledgeButton")
                                    : t("dashboard.takeawayAcknowledgedDone")}
                                </Button>
                              </Stack>
                            </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          className="table-orders-panel-shell"
          sx={{
            p: 2,
            mt: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(160deg, rgba(237,108,2,0.14) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.2) 100%)"
                : "linear-gradient(160deg, rgba(237,108,2,0.08) 0%, rgba(255,255,255,0.98) 45%, rgba(250,248,245,1) 100%)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 10px 36px rgba(0,0,0,0.45)"
                : "0 10px 32px rgba(237, 108, 2, 0.1)",
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1.5}
            sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: "divider" }}
          >
            <RestaurantIcon
              sx={{
                fontSize: 32,
                color: "warning.main",
                flexShrink: 0,
                mt: 0.25,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} color="warning.dark" sx={{ letterSpacing: 0.2 }}>
                {t("dashboard.tableOrdersPanelTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("dashboard.tableOrdersPanelSubtitle")}
              </Typography>
            </Box>
          </Stack>

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.tableOrdersPanelLoading")}
            </Typography>
          ) : tableNumbers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.tableOrdersPanelEmpty")}
            </Typography>
          ) : (
            <Grid container spacing={2} className="table-status-top-grid">
            {tableNumbers.map((tableNumber) => {
              const orders = groupedOrders[tableNumber] ?? [];
              const tableTotal = orders.reduce(
                (sum, order) =>
                  sum +
                  order.products.reduce(
                    (orderSum, product) => orderSum + product.quantity * product.price,
                    0
                  ),
                0
              );
              const deliveredIds = deliveredOrderIds[String(tableNumber)];
              const hasAnyDelivered = deliveredIds && deliveredIds.size > 0;
              return (
                <Grid item xs={12} sm={6} md={6} lg={4} key={`table-orders-${tableNumber}`}>
                  <Paper
                    elevation={2}
                    className={`table-top-item table-order-box${hasAnyDelivered ? " table-order-has-delivered" : ""}`}
                    sx={{
                      cursor: "pointer",
                      p: 2,
                      border: "2px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/orders-panel/table/${tableNumber}`)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "primary.main" }}
                      >
                        Stol {tableNumber}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          onClick={(e) => handleDelivered(String(tableNumber), orders, e)}
                        >
                          {t("dashboard.delivered")}
                        </Button>
                        <Chip size="small" label={t("dashboard.ordersCount", { count: orders.length })} variant="outlined" />
                        <TableRestaurantIcon fontSize="small" />
                      </Stack>
                    </Stack>

                    {orders.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Buyurtma yo'q
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {orders.map((order) => {
                          const isOrderDelivered = Boolean(hasAnyDelivered && deliveredIds?.has(order.orderId));
                          return (
                          <Box
                            key={`${tableNumber}-${order.orderId}`}
                            sx={{
                              border: "1px solid",
                              borderColor: isOrderDelivered ? "rgba(237, 152, 33, 0.5)" : "rgba(0,0,0,0.08)",
                              borderRadius: 1,
                              p: 1,
                              bgcolor: isOrderDelivered ? "rgba(237, 152, 33, 0.15)" : "background.paper",
                            }}
                          >
                            {order.createdAt && (
                              <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 0.5 }}>
                                {new Date(order.createdAt).toLocaleString()}
                              </Typography>
                            )}
                            <Divider sx={{ mb: 0.75 }} />
                            {order.products.length === 0 ? (
                              <Typography variant="body2" color="warning.main" fontWeight={600}>
                                {t("dashboard.noProductsInOrder")}
                              </Typography>
                            ) : (
                              <Stack spacing={0.75}>
                                {order.products.map((p, idx) => (
                                  <Stack key={`${order.orderId}-${idx}`} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                      <Box
                                        component="img"
                                        src={p.productImage || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}
                                        alt={p.productName}
                                        sx={{ width: 28, height: 28, borderRadius: 0.75, objectFit: "cover", bgcolor: "rgba(0,0,0,0.04)" }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: "1rem",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: 160,
                                        }}
                                      >
                                        {p.productName}
                                      </Typography>
                                    </Stack>
                                    <Typography variant="caption">
                                      <Box component="span" sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                                        {p.quantity} {t("dashboard.ordersUnit")}
                                      </Box>{" "}
                                      <Box component="span" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                                        - {t("dashboard.priceLabel")}: {p.quantity * p.price}
                                      </Box>
                                    </Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            )}
                          </Box>
                          );
                        })}
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
                        Jami: {tableTotal}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTableOrders(String(tableNumber));
                        }}
                      >
                        {t("dashboard.paid")}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
            </Grid>
          )}
        </Paper>
      </CardContent>
    </Card>
  );
}
