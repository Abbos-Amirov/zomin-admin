import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Avatar,
  Grid,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { createSelector } from "@reduxjs/toolkit";
import {
  retrieveOrderStatis,
  retrieveProductStatus,
  retrieveTableStatus,
} from "./selector";
import { useSelector } from "react-redux";
import { TableStatus } from "../../lib/enums/table.enum";
import { TableCall } from "../../lib/enums/tableCall.enum";
import "../../css/dashboardPage.css";
import type { PaidOrderSummary } from "../../lib/types/order";
import {
  computePaidTotalsFromOrders,
  mergePaidSummaryWithComputed,
} from "../../lib/utils/paidOrdersClientTotals";

/** REDUX SLICE & SELECTOR */
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

function KpiItem({ labelKey, value, icon, iconBg, iconColor, valueColor, onClick }: any) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const isMoney =
    labelKey === "dashboard.monthlySales" ||
    labelKey === "dashboard.todayIncome" ||
    labelKey === "dashboard.avgOrderValue" ||
    labelKey === "dashboard.todaysSales";
  
  // Handle undefined/null values and format properly
  const displayValue = (() => {
    if (value === undefined || value === null) {
      return isMoney ? "₩0" : 0;
    }
    if (isMoney) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return "₩0";
      }
      return `₩${numValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return value;
  })();

  return (
    <Paper
      elevation={1}
      className="kpi-item"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": onClick
          ? { boxShadow: 6, transform: "translateY(-3px)" }
          : {},
        "&:focus-visible": onClick
          ? { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 }
          : {},
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        className="kpi-item-content"
      >
        <Stack direction="row" spacing={1.5} alignItems="center" className="kpi-item-left">
          <Avatar
            className="kpi-item-avatar"
            sx={{ bgcolor: iconBg, color: iconColor }}
          >
            {icon}
          </Avatar>
          <Typography variant="h4" className="kpi-item-label">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" className="kpi-item-value" style={{ color: valueColor }}>
          {displayValue}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function DashboardOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderStatis } = useSelector(orderStatisRetriever);
  const { productStatus } = useSelector(productStatusRetriever);
  const { tableStatus } = useSelector(tableStatusRetriever);
  const [paidSummary, setPaidSummary] = useState<PaidOrderSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const OrderService = (await import("../../services/Order.service")).default;
        const svc = new OrderService();
        const [apiSummary, orders] = await Promise.all([
          svc.getPaidOrderSummary(),
          svc.getOrdersForStats(),
        ]);
        const computed = computePaidTotalsFromOrders(orders);
        const merged = mergePaidSummaryWithComputed(apiSummary, computed);
        if (!cancelled) setPaidSummary(merged);
      } catch {
        if (!cancelled) setPaidSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Umumiy savdo: paid/summary + to‘langan buyurtmalar yig‘indisi (birlashtirilgan).
   * Bugungi savdo: API `todaySum` bo‘lmasa, ro‘yxatdan bugungi kun (mahalliy vaqt) bo‘yicha hisoblanadi.
   */
  const displayMonthlySales = paidSummary?.totalSum ?? 0;
  const displayTodaysSales = paidSummary?.todaySum ?? 0;

  const kpis = [
    // ===== Orders =====
    {
      labelKey: "dashboard.totalOrders",
      value: orderStatis?.totalOrder,
      icon: <ReceiptLongIcon />,
      iconBg: "#e3f2fd",
      iconColor: "#1976d2",
      valueColor: "#1976d2",
      onClick: () => navigate("/dashboard/kpi/total-orders"),
    },
    {
      labelKey: "dashboard.pendingOrders",
      value: orderStatis?.pendingOrder,
      icon: <QueryBuilderIcon />,
      iconBg: "#fff8e1",
      iconColor: "#f9a825",
      valueColor: "#f9a825",
      onClick: () => navigate("/dashboard/kpi/pending-orders"),
    },
    {
      labelKey: "dashboard.completedOrders",
      value: orderStatis?.complatedOrder,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
      onClick: () => navigate("/completed-orders-stats"),
    },

    // ===== Items =====
    {
      labelKey: "dashboard.totalItems",
      value: productStatus[0]?.total,
      icon: <RestaurantMenuIcon />,
      iconBg: "#eef2ff",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
      onClick: () => navigate("/dashboard/kpi/total-items"),
    },
    {
      labelKey: "dashboard.availableItems",
      value: productStatus[0]?.available,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
      onClick: () => navigate("/dashboard/kpi/available-items"),
    },
    {
      labelKey: "dashboard.unavailableItems",
      value: productStatus[0]?.unavailable,
      icon: <CancelRoundedIcon />,
      iconBg: "#ffebee",
      iconColor: "#c62828",
      valueColor: "#c62828",
      onClick: () => navigate("/dashboard/kpi/unavailable-items"),
    },
    // ===== Tables =====
    {
      labelKey: "dashboard.freeTables",
      value: tableStatus?.filter(
        (val) => val.tableStatus === TableStatus.AVAILABLE
      ).length,
      icon: <TableRestaurantIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
      onClick: () => navigate("/dashboard/kpi/free-tables"),
    },
    {
      labelKey: "dashboard.tablesOccupied",
      value: tableStatus?.filter(
        (val) => val.tableStatus === TableStatus.OCCUPIED
      ).length,
      icon: <TableRestaurantIcon />,
      iconBg: "#ede7f6",
      iconColor: "#5e35b1",
      valueColor: "#5e35b1",
      onClick: () => navigate("/dashboard/kpi/tables-occupied"),
    },
    {
      labelKey: "dashboard.cleaningTables",
      value: tableStatus?.filter(
        (val) => val.tableStatus === TableStatus.CLEANING
      ).length,
      icon: <TableRestaurantIcon />,
      iconBg: "#fff8e1",
      iconColor: "#c62828",
      valueColor: "#c62828",
      onClick: () => navigate("/dashboard/kpi/cleaning-tables"),
    },

    // ===== Other Metrics =====
    {
      labelKey: "dashboard.callWaiterRequests",
      value: tableStatus?.filter((val) => val.tableCall === TableCall.ACTIVE)
        .length,
      icon: <NotificationsRoundedIcon />,
      iconBg: "#fff3e0",
      iconColor: "#ef6c00",
      valueColor: "#ef6c00",
      onClick: () => navigate("/dashboard/kpi/call-waiter"),
    },
    {
      labelKey: "dashboard.monthlySales",
      value: displayMonthlySales,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
      onClick: () => navigate("/sales-stats"),
    },
    {
      labelKey: "dashboard.todaysSales",
      value: displayTodaysSales,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
      onClick: () => navigate("/sales-stats"),
    },
  ];
  return (
    <Box className="dashboard-overview-container">
      <Card className="dashboard-card">
        <CardContent className="dashboard-card-content">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            className="dashboard-header"
          >
            <Avatar
              variant="rounded"
              className="dashboard-header-avatar"
            >
              <DashboardCustomizeRoundedIcon />
            </Avatar>
            <Typography variant="h3" className="dashboard-header-title">
              {t("dashboard.overview")}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {kpis.map((k) => (
              <Grid item xs={12} sm={6} md={4} key={k.labelKey}>
                <KpiItem {...k} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
