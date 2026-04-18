import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  retrieveOrderStatis,
  retrieveProductStatus,
  retrieveTableStatus,
} from "./selector";
import { TableStatus } from "../../lib/enums/table.enum";
import { TableCall } from "../../lib/enums/tableCall.enum";
import { Table } from "../../lib/types/table";

const orderStatisRetriever = createSelector(
  retrieveOrderStatis,
  (orderStatis) => ({ orderStatis })
);
const productStatusRetriever = createSelector(
  retrieveProductStatus,
  (productStatus) => ({ productStatus })
);
const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

const VALID_METRICS = new Set([
  "total-orders",
  "pending-orders",
  "total-items",
  "available-items",
  "unavailable-items",
  "free-tables",
  "tables-occupied",
  "cleaning-tables",
  "call-waiter",
  "avg-order-value",
]);

function formatMoney(n: number): string {
  const num = Number(n) || 0;
  return `₩${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function DashboardKpiDetailPage() {
  const { metric } = useParams<{ metric: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const { orderStatis } = useSelector(orderStatisRetriever);
  const { productStatus } = useSelector(productStatusRetriever);
  const { tableStatus } = useSelector(tableStatusRetriever);

  const tables = Array.isArray(tableStatus) ? (tableStatus as Table[]) : [];
  const prod = productStatus?.[0];

  const titleKey = useMemo(() => {
    const map: Record<string, string> = {
      "total-orders": "dashboard.totalOrders",
      "pending-orders": "dashboard.pendingOrders",
      "total-items": "dashboard.totalItems",
      "available-items": "dashboard.availableItems",
      "unavailable-items": "dashboard.unavailableItems",
      "free-tables": "dashboard.freeTables",
      "tables-occupied": "dashboard.tablesOccupied",
      "cleaning-tables": "dashboard.cleaningTables",
      "call-waiter": "dashboard.callWaiterRequests",
      "avg-order-value": "dashboard.todaysSales",
    };
    return metric ? map[metric] ?? "dashboard.overview" : "dashboard.overview";
  }, [metric]);

  const descKey = `dashboard.kpiDetailDesc.${String(metric).replace(/-/g, "_")}`;

  if (!metric || !VALID_METRICS.has(metric)) {
    return <Navigate to="/" replace />;
  }

  const freeTables = tables.filter((x) => x.tableStatus === TableStatus.AVAILABLE);
  const occupiedTables = tables.filter((x) => x.tableStatus === TableStatus.OCCUPIED);
  const cleaningTables = tables.filter((x) => x.tableStatus === TableStatus.CLEANING);
  const callTables = tables.filter((x) => x.tableCall === TableCall.ACTIVE);

  const aov = orderStatis?.todayIncomeAndAOV?.[0];
  const totalProducts = Number(prod?.total ?? 0) || 0;
  const available = Number(prod?.available ?? 0) || 0;
  const unavailable = Number(prod?.unavailable ?? 0) || 0;

  const pct = (part: number, whole: number) =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

  const heroGradient =
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.35)} 0%, ${alpha("#0d1117", 0.95)} 55%, ${alpha(theme.palette.secondary.dark, 0.25)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.45)} 0%, ${theme.palette.background.paper} 48%, ${alpha(theme.palette.warning.light, 0.35)} 100%)`;

  const StatMini = ({
    label,
    value,
    sub,
    accent,
  }: {
    label: string;
    value: React.ReactNode;
    sub?: string;
    accent?: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(accent ?? theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.06),
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );

  const TableChips = ({ list, emptyKey }: { list: Table[]; emptyKey: string }) => (
    <Box sx={{ mt: 2 }}>
      {list.length === 0 ? (
        <Typography color="text.secondary">{t(emptyKey)}</Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {list.map((tb) => (
            <Chip
              key={tb._id}
              label={`${t("dashboard.linkDineInStolWord")} ${tb.tableNumber}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );

  let mainValue: React.ReactNode = "—";
  let body: React.ReactNode = null;

  switch (metric) {
    case "total-orders":
      mainValue = orderStatis?.totalOrder ?? "—";
      body = (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatMini
              label={t("dashboard.pendingOrders")}
              value={orderStatis?.pendingOrder ?? 0}
              accent={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatMini
              label={t("dashboard.completedOrders")}
              value={orderStatis?.complatedOrder ?? 0}
              accent={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatMini
              label={t("dashboard.totalOrders")}
              value={orderStatis?.totalOrder ?? 0}
              accent={theme.palette.primary.main}
            />
          </Grid>
        </Grid>
      );
      break;
    case "pending-orders":
      mainValue = orderStatis?.pendingOrder ?? "—";
      body = null;
      break;
    case "total-items":
      mainValue = totalProducts;
      body = (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatMini label={t("dashboard.availableItems")} value={available} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatMini label={t("dashboard.unavailableItems")} value={unavailable} />
          </Grid>
        </Grid>
      );
      break;
    case "available-items":
      mainValue = available;
      body = (
        <StatMini
          label={t("dashboard.kpiDetailShareOfMenu")}
          value={`${pct(available, totalProducts)}%`}
          sub={t("dashboard.kpiDetailOfTotalItems", { total: totalProducts })}
        />
      );
      break;
    case "unavailable-items":
      mainValue = unavailable;
      body = (
        <StatMini
          label={t("dashboard.kpiDetailShareOfMenu")}
          value={`${pct(unavailable, totalProducts)}%`}
          sub={t("dashboard.kpiDetailOfTotalItems", { total: totalProducts })}
        />
      );
      break;
    case "free-tables":
      mainValue = freeTables.length;
      body = <TableChips list={freeTables} emptyKey="dashboard.kpiDetailNoTablesInState" />;
      break;
    case "tables-occupied":
      mainValue = occupiedTables.length;
      body = <TableChips list={occupiedTables} emptyKey="dashboard.kpiDetailNoTablesInState" />;
      break;
    case "cleaning-tables":
      mainValue = cleaningTables.length;
      body = <TableChips list={cleaningTables} emptyKey="dashboard.kpiDetailNoTablesInState" />;
      break;
    case "call-waiter":
      mainValue = callTables.length;
      body = <TableChips list={callTables} emptyKey="dashboard.kpiDetailNoWaiterCalls" />;
      break;
    case "avg-order-value":
      mainValue = formatMoney(Number(aov?.totalSum ?? 0));
      body = (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatMini
              label={t("dashboard.avgOrderValue")}
              value={formatMoney(Number(aov?.aovGross ?? 0))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatMini
              label={t("dashboard.kpiDetailDeliveryShare")}
              value={formatMoney(Number(aov?.deliverySum ?? 0))}
            />
          </Grid>
        </Grid>
      );
      break;
    default:
      break;
  }

  const quickNav =
    metric === "total-orders" || metric === "pending-orders" ? (
      <Button variant="outlined" onClick={() => navigate("/orders")}>
        {t("dashboard.kpiDetailOpenOrders")}
      </Button>
    ) : metric === "total-items" || metric === "available-items" || metric === "unavailable-items" ? (
      <Button variant="outlined" onClick={() => navigate("/products")}>
        {t("dashboard.kpiDetailOpenMenu")}
      </Button>
    ) : metric === "free-tables" ||
      metric === "tables-occupied" ||
      metric === "cleaning-tables" ||
      metric === "call-waiter" ? (
      <Button variant="outlined" onClick={() => navigate("/tables")}>
        {t("dashboard.kpiDetailOpenTables")}
      </Button>
    ) : metric === "avg-order-value" ? (
      <Button variant="outlined" onClick={() => navigate("/sales-stats")}>
        {t("dashboard.kpiDetailOpenSales")}
      </Button>
    ) : null;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ mb: 2, fontWeight: 700 }}
      >
        {t("dashboard.kpiDetailBack")}
      </Button>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: theme.palette.mode === "dark" ? "0 24px 48px rgba(0,0,0,0.45)" : "0 16px 40px rgba(15,23,42,0.08)",
        }}
      >
        <Box sx={{ background: heroGradient, px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 1.2 }}>
            {t("dashboard.kpiDetailBadge")}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
            {t(titleKey)}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 640 }}>
            {t(descKey)}
          </Typography>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              mt: 2,
              fontSize: { xs: "2.25rem", sm: "2.75rem" },
              textShadow: theme.palette.mode === "dark" ? "0 2px 24px rgba(0,0,0,0.5)" : "none",
            }}
          >
            {mainValue}
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {body ? (
            <>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                {t("dashboard.kpiDetailMore")}
              </Typography>
              {body}
            </>
          ) : null}
          {quickNav && (
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{
                mt: body ? 3 : 0,
                pt: body ? 2.5 : 0,
                borderTop: body ? 1 : 0,
                borderColor: "divider",
              }}
            >
              {quickNav}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
