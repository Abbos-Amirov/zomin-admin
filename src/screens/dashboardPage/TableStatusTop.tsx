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
  Button,
  Paper,
  Link,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { createSelector } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { retrieveTableStatus } from "./selector";
import { Table } from "../../lib/types/table";
import OrderService from "../../services/Order.service";
import { serverApi, socket } from "../../lib/config";
import { setTableStatus } from "./slice";
import { TableStatus } from "../../lib/enums/table.enum";
import TableService from "../../services/Table.service";
import "../../css/tableStatus.css";
import { OrderType } from "../../lib/enums/order.enum";
import {
  extractProductsFromOrder,
  type ProductLine,
} from "../../lib/utils/extractOrderProducts";

/** Panel API dan kelgan buyurtma (stol) */
type PanelOrderView = {
  orderId: string;
  orderType: "TABLE" | "TAKEOUT";
  tableId: string;
  tableNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  products: ProductLine[];
};

/** `/admin/order/link/dine-in` — mijoz + taomlar */
type LinkDineInOrderView = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  /** purge-by-member uchun */
  memberId?: string | null;
  arrivalInMinutes: number | null;
  createdAt: string;
  tableNumber?: string;
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

function mapLinkDineInRow(
  order: any,
  resolveImageUrl: (path?: string | null) => string
): LinkDineInOrderView | null {
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
  const [linkDineInOrders, setLinkDineInOrders] = useState<LinkDineInOrderView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  /** Berildi bosilganda o'sha paytda mavjud bo'lgan order ID lar; sessionStorage da saqlanadi */
  const [deliveredOrderIds, setDeliveredOrderIds] = useState<Record<string, Set<string>>>(parseStored);
  /** Link orqali o'tirib yeyish: berildi belgilangan buyurtma IDlari */
  const [linkDineInDeliveredIds, setLinkDineInDeliveredIds] = useState<Set<string>>(parseLinkDineDelivered);
  /** Stol yashigi "To'landi" — joriy buyurtmalar imzosi bilan yashirinadi */
  const [linkDinePaidBundleSigs, setLinkDinePaidBundleSigs] =
    useState<Record<string, string>>(parsePaidBundleSigs);

  const resolveImageUrl = useCallback((path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = serverApi.endsWith("/") ? serverApi.slice(0, -1) : serverApi;
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }, []);

  const fetchOrdersByTable = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data: payload } = await axios.get(`${serverApi}/admin/orders/all/panel`, {
        withCredentials: true,
      });
      const panelRows: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
        ? payload.orders
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.orders)
        ? payload.data.orders
        : Array.isArray(payload?.rows)
        ? payload.rows
        : Array.isArray(payload?.result)
        ? payload.result
        : Array.isArray(payload?.tables)
        ? payload.tables
        : [];

      const grouped: Record<string, PanelOrderView[]> = {};

      const mapOrderToView = (order: any): PanelOrderView | null => {
        const orderTypeRaw = String(order?.orderType ?? order?.order_type ?? "").toUpperCase();
        if (orderTypeRaw === OrderType.DELIVERY) return null;
        const orderStatus = String(order?.orderStatus ?? order?.order_status ?? "").toUpperCase();
        if (orderStatus === "COMPLETED" || orderStatus === "CANCELLED" || orderStatus === "CANCELED") return null;

        const normalizedType: "TABLE" | "TAKEOUT" =
          orderTypeRaw === OrderType.TAKEOUT ? "TAKEOUT" : "TABLE";

        const products = extractProductsFromOrder(order, resolveImageUrl);

        const tableNumberStr = String(
          order?.tableNumber ?? order?.table_number ?? ""
        ).trim();

        return {
          orderId: String(order?._id ?? order?.id ?? ""),
          orderType: normalizedType,
          tableId: String(order?.tableId ?? order?.table_id ?? ""),
          tableNumber: tableNumberStr,
          orderStatus: String(order?.orderStatus ?? order?.order_status ?? ""),
          paymentStatus: String(order?.paymentStatus ?? order?.payment_status ?? ""),
          paymentMethod: String(order?.paymentMethod ?? order?.payment_method ?? ""),
          createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
          products,
        };
      };

      panelRows.forEach((row: any) => {
        const nestedOrders = Array.isArray(row?.orders)
          ? row.orders
          : Array.isArray(row?.orderList)
          ? row.orderList
          : Array.isArray(row?.items)
          ? row.items
          : null;

        if (nestedOrders) {
          nestedOrders.forEach((order: any) => {
            const tableNumber = String(
              order?.tableNumber ??
                order?.table_number ??
                row?.tableNumber ??
                row?.table_number ??
                row?.table?.tableNumber ??
                row?.table?.table_number ??
                ""
            ).trim();
            const orderView = mapOrderToView({
              ...order,
              tableNumber:
                order?.tableNumber ??
                order?.table_number ??
                row?.tableNumber ??
                row?.table_number ??
                row?.table?.tableNumber,
            });
            if (!orderView) return;
            if (orderView.orderType === "TAKEOUT") return;
            if (!tableNumber) return;
            if (!grouped[tableNumber]) grouped[tableNumber] = [];
            grouped[tableNumber].push(orderView);
          });
          return;
        }

        const tableNumber = String(
          row?.tableNumber ?? row?.table_number ?? row?.table?.tableNumber ?? row?.table?.table_number ?? ""
        ).trim();
        const orderView = mapOrderToView(row);
        if (!orderView) return;
        if (orderView.orderType === "TAKEOUT") return;
        if (!tableNumber) return;
        if (!grouped[tableNumber]) grouped[tableNumber] = [];
        grouped[tableNumber].push(orderView);
      });

      setGroupedOrders(grouped);

      let linkViews: LinkDineInOrderView[] = [];
      try {
        const orderSvc = new OrderService();
        const linkRows = await orderSvc.getLinkDineInOrders();
        for (const row of linkRows) {
          const v = mapLinkDineInRow(row, resolveImageUrl);
          if (v) linkViews.push(v);
        }
      } catch (linkErr) {
        console.warn("fetchOrdersByTable: link dine-in", linkErr);
        linkViews = [];
      }
      setLinkDineInOrders(linkViews);
    } catch (err) {
      console.error("fetchOrdersByTable error:", err);
      setGroupedOrders({});
      setLinkDineInOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [resolveImageUrl]);

  useEffect(() => {
    fetchOrdersByTable();
  }, [fetchOrdersByTable]);

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
      fetchOrdersByTable(true);
    };
    const refreshByAnyOrderEvent = (eventName: string) => {
      if (String(eventName).toLowerCase().includes("order")) {
        fetchOrdersByTable(true);
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
  }, [fetchOrdersByTable]);

  useEffect(() => {
    // Socket uzilib qolsa ham list eskirib qolmasligi uchun fallback
    const id = window.setInterval(() => {
      fetchOrdersByTable(true);
    }, 5000);

    return () => window.clearInterval(id);
  }, [fetchOrdersByTable]);

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

      const sig = linkDineBundleSignature(orders);
      setLinkDinePaidBundleSigs((prev) => ({ ...prev, [tableKey]: sig }));
    },
    []
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
        await orderSvc.completeTableOrders(tableId);

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
        fetchOrdersByTable(true);
      } catch (err) {
        console.error("handleCompleteTableOrders error:", err);
      }
    },
    [dispatch, fetchOrdersByTable, groupedOrders, tableStatus]
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
              <TableRestaurantIcon color="primary" sx={{ fontSize: 28 }} />
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

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading orders...
          </Typography>
        ) : tableNumbers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Faol (yakunlanmagan) stol buyurtmalari topilmadi.
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
      </CardContent>
    </Card>
  );
}
