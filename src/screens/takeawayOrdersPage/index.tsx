import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import OrderService from "../../services/Order.service";
import { serverApi } from "../../lib/config";
import {
  extractProductsFromOrder,
  type ProductLine,
} from "../../lib/utils/extractOrderProducts";
import { playNotificationSound } from "../../lib/utils/playNotificationSound";

type TakeoutOrderView = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  arrivalInMinutes: number | null;
  createdAt: string;
  memberKey: string;
  products: ProductLine[];
};

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "#";
  return `tel:${digits}`;
}

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

/** Backend bir xil mijozni memberId yoki telefon orqali bog‘lashi mumkin */
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

export default function TakeawayOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<TakeoutOrderView[]>([]);
  const [loading, setLoading] = useState(false);
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
        if (isFirstFetchRef.current) {
          isFirstFetchRef.current = false;
          knownOrderIdsRef.current = idsNow;
        } else {
          const newOnes = list.filter((o) => !knownOrderIdsRef.current.has(o.orderId));
          knownOrderIdsRef.current = idsNow;
          if (newOnes.length > 0) {
            setTakeawayAlertOrders(newOnes);
            setTakeawayAlertOpen(true);
            playNotificationSound();
          }
        }
      } catch (err) {
        console.error("TakeawayOrdersPage fetch error:", err);
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
    const id = window.setInterval(() => {
      fetchTakeaway(true);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchTakeaway]);

  const ordersByMember = useMemo(() => {
    const by: Record<string, TakeoutOrderView[]> = {};
    for (const o of orders) {
      if (!by[o.memberKey]) by[o.memberKey] = [];
      by[o.memberKey].push(o);
    }
    for (const k of Object.keys(by)) {
      by[k].sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
      });
    }
    const keys = Object.keys(by).sort((a, b) => {
      const nameA = by[a][0]?.customerName ?? "";
      const nameB = by[b][0]?.customerName ?? "";
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
    return { by, keys };
  }, [orders]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LocalShippingIcon color="secondary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {t("dashboard.takeawayPageTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.takeawayPageSubtitleLink")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                {t("dashboard.takeawayPollHint")}
              </Typography>
            </Box>
          </Stack>
          <Button variant="outlined" size="small" onClick={() => fetchTakeaway(false)} disabled={loading}>
            {loading ? t("dashboard.takeawayPageLoading") : t("dashboard.refreshTakeaway")}
          </Button>
        </Stack>

        <Dialog
          open={takeawayAlertOpen}
          onClose={() => setTakeawayAlertOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="takeaway-new-alert-title"
        >
          <DialogTitle id="takeaway-new-alert-title" sx={{ fontWeight: 800, color: "secondary.main" }}>
            {t("dashboard.takeawayNewOrderAlertTitle")}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {takeawayAlertOrders.map((o) => {
                const lineTotal = o.products.reduce((s, p) => s + p.quantity * p.price, 0);
                const arrivalClock =
                  o.arrivalInMinutes != null && o.createdAt
                    ? formatArrivalClock(o.createdAt, o.arrivalInMinutes)
                    : null;
                return (
                  <Paper key={o.orderId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.25}>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                        {t("dashboard.takeawayOrderInBox")} · …{o.orderId.slice(-8)}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                        <Typography fontWeight={700}>{o.customerName || t("dashboard.takeawayUnknownCustomer")}</Typography>
                      </Stack>
                      {o.customerPhone ? (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Link href={telHref(o.customerPhone)} underline="hover" color="secondary" fontWeight={600}>
                            {o.customerPhone}
                          </Link>
                        </Stack>
                      ) : null}
                      {o.arrivalInMinutes != null ? (
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <AccessTimeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="body2" fontWeight={600}>
                            {t("dashboard.arrivalInMinutes", { min: o.arrivalInMinutes })}
                            {arrivalClock ? (
                              <Box component="span" sx={{ fontWeight: 700, ml: 0.75 }}>
                                · {arrivalClock}
                              </Box>
                            ) : null}
                          </Typography>
                        </Stack>
                      ) : null}
                      <Divider />
                      {o.products.length === 0 ? (
                        <Typography variant="body2" color="warning.main">
                          {t("dashboard.noProductsInOrder")}
                        </Typography>
                      ) : (
                        <Stack spacing={0.75}>
                          {o.products.map((p, idx) => (
                            <Stack
                              key={`${o.orderId}-alert-p-${idx}`}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                {p.productName}
                              </Typography>
                              <Typography variant="body2" fontWeight={700} whiteSpace="nowrap">
                                ×{p.quantity} · {p.quantity * p.price}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                      <Typography variant="subtitle1" fontWeight={800} color="secondary.main" textAlign="right">
                        {lineTotal}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => setTakeawayAlertOpen(false)}>
              {t("dashboard.takeawayNewOrderAlertOk")}
            </Button>
          </DialogActions>
        </Dialog>

        {loading ? (
          <Typography color="text.secondary">{t("dashboard.takeawayPageLoading")}</Typography>
        ) : ordersByMember.keys.length === 0 ? (
          <Typography color="text.secondary">{t("dashboard.noTakeawayOrders")}</Typography>
        ) : (
          <Grid container spacing={2.5} alignItems="stretch">
            {ordersByMember.keys.map((memberKey) => {
              const memberOrders = ordersByMember.by[memberKey] ?? [];
              const first = memberOrders[0];
              const displayName = first?.customerName || t("dashboard.takeawayUnknownCustomer");
              const displayPhone = first?.customerPhone ?? "";
              const orderForArrival = memberOrders.find((o) => o.arrivalInMinutes != null) ?? first;
              const headerArrivalMin = orderForArrival?.arrivalInMinutes ?? null;
              const headerArrivalClock =
                headerArrivalMin != null && orderForArrival?.createdAt
                  ? formatArrivalClock(orderForArrival.createdAt, headerArrivalMin)
                  : null;
              const totalAll = memberOrders.reduce(
                (sum, o) => sum + o.products.reduce((s, p) => s + p.quantity * p.price, 0),
                0
              );

              return (
                <Grid item xs={12} md={6} lg={4} key={memberKey}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: "secondary.light",
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(160deg, rgba(156,39,176,0.08) 0%, rgba(0,0,0,0.2) 100%)"
                          : "linear-gradient(160deg, rgba(156,39,176,0.06) 0%, rgba(255,255,255,0.98) 100%)",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <PersonIcon color="secondary" />
                        <Typography variant="h6" fontWeight={800} color="secondary.dark">
                          {displayName}
                        </Typography>
                        <Chip size="small" label={memberOrders.length} color="secondary" variant="outlined" />
                      </Stack>

                      {displayPhone ? (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Link
                            component="a"
                            href={telHref(displayPhone)}
                            underline="hover"
                            color="secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            {displayPhone}
                          </Link>
                        </Stack>
                      ) : null}

                      {headerArrivalMin != null ? (
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                          <AccessTimeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="body2" component="div" fontWeight={600}>
                            {t("dashboard.arrivalInMinutes", { min: headerArrivalMin })}
                            {headerArrivalClock ? (
                              <Box component="span" sx={{ fontWeight: 700, ml: 0.75, whiteSpace: "nowrap" }}>
                                · {headerArrivalClock}
                              </Box>
                            ) : null}
                          </Typography>
                        </Stack>
                      ) : null}

                      <Divider />

                      <Stack spacing={2}>
                        {memberOrders.map((o) => {
                          const lineTotal = o.products.reduce((s, p) => s + p.quantity * p.price, 0);
                          return (
                            <Paper
                              key={o.orderId}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                "&:hover": { borderColor: "secondary.main", bgcolor: "action.hover" },
                              }}
                              onClick={() => navigate(`/orders/${o.orderId}`)}
                            >
                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <ReceiptLongIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                      {t("dashboard.takeawayOrderInBox")} · …{o.orderId.slice(-6)}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="subtitle1" fontWeight={800} color="secondary.main">
                                    {lineTotal}
                                  </Typography>
                                </Stack>

                                {o.createdAt ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(o.createdAt).toLocaleString()}
                                  </Typography>
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
                                              width: 36,
                                              height: 36,
                                              borderRadius: 1,
                                              objectFit: "cover",
                                              bgcolor: "action.hover",
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
                                            {p.productName}
                                          </Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={700}>
                                          ×{p.quantity} · {p.quantity * p.price}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                )}
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Stack>

                      <Stack direction="row" justifyContent="flex-end" pt={0.5}>
                        <Typography variant="subtitle2" fontWeight={800} color="secondary.dark">
                          {t("dashboard.takeawayMemberTotal")}: {totalAll}
                        </Typography>
                      </Stack>
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
