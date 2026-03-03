import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, Typography, Stack, Grid, Box, Divider, Chip, Button } from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { createSelector } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { retrieveTableStatus } from "./selector";
import { Table } from "../../lib/types/table";
import OrderService from "../../services/Order.service";
import { serverApi, socket } from "../../lib/config";
import { setTableStatus } from "./slice";
import { TableStatus } from "../../lib/enums/table.enum";
import TableService from "../../services/Table.service";
import "../../css/tableStatus.css";

const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

export default function TableStatusTop() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tableStatus } = useSelector(tableStatusRetriever);
  const [groupedOrders, setGroupedOrders] = useState<
    Record<string, { orderId: string; tableId: string; orderStatus: string; paymentStatus: string; paymentMethod: string; createdAt: string; products: { productName: string; productImage: string; quantity: number; price: number }[] }[]>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  const resolveImageUrl = useCallback((path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = serverApi.endsWith("/") ? serverApi.slice(0, -1) : serverApi;
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }, []);

  const fetchOrdersByTable = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const svc = new OrderService();
      const payload = (await svc.getAllOrders({ page: 1, limit: 1000 } as any)) as any;
      const rawOrders = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
        ? payload.orders
        : Array.isArray(payload?.data?.orders)
        ? payload.data.orders
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.result)
        ? payload.result
        : Array.isArray(payload?.rows)
        ? payload.rows
        : [];

      const grouped: Record<string, { orderId: string; tableId: string; orderStatus: string; paymentStatus: string; paymentMethod: string; createdAt: string; products: { productName: string; productImage: string; quantity: number; price: number }[] }[]> = {};

      rawOrders.forEach((order: any) => {
        const orderType = String(order?.orderType ?? order?.order_type ?? "").toUpperCase();
        if (orderType && orderType !== "TABLE") return;
        const orderStatus = String(order?.orderStatus ?? order?.order_status ?? "").toUpperCase();
        if (orderStatus === "COMPLETED" || orderStatus === "CANCELLED" || orderStatus === "CANCELED") return;

        const tableNumberRaw =
          order?.tableNumber ?? order?.table_number ?? order?.table?.tableNumber ?? order?.table?.table_number;
        const tableNumber = String(tableNumberRaw ?? "").trim();
        if (!tableNumber) return;

        const orderItems = Array.isArray(order?.orderItems)
          ? order.orderItems
          : Array.isArray(order?.order_items)
          ? order.order_items
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

        const products = orderItems.map((item: any) => {
          const productId = String(
            item?.productId ?? item?.product_id ?? item?.product?._id ?? item?.product?.id ?? ""
          ).trim();
          const product = productById.get(productId) ?? item?.product ?? {};
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
              product?.productName ?? product?.product_name ?? item?.productName ?? item?.product_name ?? "Unknown product"
            ),
            productImage,
            quantity,
            price,
          };
        });

        const orderView = {
          orderId: String(order?._id ?? order?.id ?? ""),
          tableId: String(order?.tableId ?? order?.table_id ?? ""),
          orderStatus: String(order?.orderStatus ?? order?.order_status ?? ""),
          paymentStatus: String(order?.paymentStatus ?? order?.payment_status ?? ""),
          paymentMethod: String(order?.paymentMethod ?? order?.payment_method ?? ""),
          createdAt: String(order?.createdAt ?? order?.updatedAt ?? ""),
          products,
        };

        if (!grouped[tableNumber]) grouped[tableNumber] = [];
        grouped[tableNumber].push(orderView);
      });

      setGroupedOrders(grouped);
    } catch (err) {
      console.error("fetchOrdersByTable error:", err);
      setGroupedOrders({});
    } finally {
      if (!silent) setLoading(false);
    }
  }, [resolveImageUrl]);

  useEffect(() => {
    fetchOrdersByTable();
  }, [fetchOrdersByTable]);

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
          const nextTables = currentTables.map((t) =>
            t._id === tableId ? { ...t, tableStatus: TableStatus.CLEANING } : t
          );
          dispatch(setTableStatus(nextTables));
        }

        // Backend table status ham sync bo‘lsin
        const tableSvc = new TableService();
        await tableSvc.updateChosenTable({
          _id: tableId,
          tableStatus: TableStatus.CLEANING,
        });

        // Bu paneldan yo‘qolsin
        fetchOrdersByTable(true);
      } catch (err) {
        console.error("handleCompleteTableOrders error:", err);
      }
    },
    [dispatch, fetchOrdersByTable, groupedOrders, tableStatus]
  );

  return (
    <Card className="table-status-card table-status-top-card">
      <CardContent sx={{ width: "100%", padding: "12px 16px" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h5" className="table-status-top-title">
            {t("dashboard.ordersPanel")}
          </Typography>
        </Stack>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading orders...
          </Typography>
        ) : (
          <Grid container spacing={1} className="table-status-top-grid">
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
              return (
                <Grid item xs={12} md={6} lg={4} key={`table-orders-${tableNumber}`}>
                  <Box
                    className="table-top-item"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/orders-panel/table/${tableNumber}`)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" className="table-top-number">
                        Stol {tableNumber}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip size="small" label={`${orders.length} ta order`} />
                        <TableRestaurantIcon fontSize="small" />
                      </Stack>
                    </Stack>

                    {orders.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Buyurtma yo'q
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {orders.map((order) => (
                          <Box key={`${tableNumber}-${order.orderId}`} sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 1, p: 1 }}>
                            {order.createdAt && (
                              <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 0.5 }}>
                                {new Date(order.createdAt).toLocaleString()}
                              </Typography>
                            )}
                            <Divider sx={{ mb: 0.75 }} />
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
                                      {p.quantity}x
                                    </Box>{" "}
                                    <Box component="span" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                                      - price: {p.quantity * p.price}
                                    </Box>
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
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
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
