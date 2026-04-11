import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { closeLinkDineAlert } from "../../screens/dashboardPage/slice";
import {
  retrieveLinkDineAlertOpen,
  retrieveLinkDineAlertOrders,
  retrieveLinkDinePendingAckCount,
} from "../../screens/dashboardPage/selector";

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

/** Yangi link dine-in buyurtma — barcha admin sahifalarida Redux orqali */
export default function LinkDineInNewOrderDialog() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector(retrieveLinkDineAlertOpen);
  const linkDineAlertOrders = useSelector(retrieveLinkDineAlertOrders);
  const linkDinePendingAckCount = useSelector(retrieveLinkDinePendingAckCount);

  const handleClose = () => dispatch(closeLinkDineAlert());

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="link-dine-new-alert-title"
    >
      <DialogTitle
        id="link-dine-new-alert-title"
        sx={{
          fontWeight: 800,
          color: "primary.main",
          fontSize: { xs: "1.4rem", sm: "1.75rem" },
          lineHeight: 1.35,
          pr: 6,
        }}
      >
        {t("dashboard.linkDineInNewOrderAlertTitle")}
        {linkDinePendingAckCount > 0 ? (
          <Chip
            component="span"
            size="small"
            label={linkDinePendingAckCount}
            color="primary"
            sx={{ ml: 1, fontWeight: 800, verticalAlign: "middle" }}
          />
        ) : null}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {linkDineAlertOrders.map((o, idx) => {
            const lineTotal = o.products.reduce((s, p) => s + p.quantity * p.price, 0);
            const arrivalClock =
              o.arrivalInMinutes != null && o.createdAt
                ? formatArrivalClock(o.createdAt, o.arrivalInMinutes)
                : null;
            const tableLabel = o.tableNumber?.trim()
              ? o.tableNumber.trim()
              : t("dashboard.linkDineInNoTable");
            return (
              <Paper key={o.orderId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                      {t("dashboard.linkDineInOrderShort")} · …{o.orderId.slice(-8)}
                    </Typography>
                    <Chip size="small" label={idx + 1} color="primary" variant="filled" sx={{ fontWeight: 800 }} />
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <TableRestaurantIcon sx={{ fontSize: 20, color: "primary.main" }} />
                    <Typography variant="body2" fontWeight={700}>
                      {t("dashboard.linkDineInAlertTable")}: {tableLabel}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    <Typography fontWeight={700}>{o.customerName || "—"}</Typography>
                  </Stack>
                  {o.customerPhone ? (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <PhoneIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                      <Link href={telHref(o.customerPhone)} underline="hover" color="primary" fontWeight={600}>
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
                      {o.products.map((p, pidx) => (
                        <Stack
                          key={`${o.orderId}-alert-p-${pidx}`}
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
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main" textAlign="right">
                    {lineTotal}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleClose}>
          {t("dashboard.linkDineInAlertOk")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
