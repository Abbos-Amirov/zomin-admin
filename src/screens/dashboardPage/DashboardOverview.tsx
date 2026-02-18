import React from "react";
import { useTranslation } from "react-i18next";
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

function KpiItem({ labelKey, value, icon, iconBg, iconColor, valueColor }: any) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const isMoney = labelKey === "dashboard.todayIncome" || labelKey === "dashboard.avgOrderValue";
  
  // Handle undefined/null values and format properly
  const displayValue = (() => {
    if (value === undefined || value === null) {
      return isMoney ? "$0.0" : 0;
    }
    if (isMoney) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return "$0.0";
      }
      return `$${numValue.toFixed(2)}`;
    }
    return value;
  })();

  return (
    <Paper elevation={1} className="kpi-item">
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
  const { orderStatis } = useSelector(orderStatisRetriever);
  const { productStatus } = useSelector(productStatusRetriever);
  const { tableStatus } = useSelector(tableStatusRetriever);
  const kpis = [
    // ===== Orders =====
    {
      labelKey: "dashboard.totalOrders",
      value: orderStatis?.totalOrder,
      icon: <ReceiptLongIcon />,
      iconBg: "#e3f2fd",
      iconColor: "#1976d2",
      valueColor: "#1976d2",
    },
    {
      labelKey: "dashboard.pendingOrders",
      value: orderStatis?.pendingOrder,
      icon: <QueryBuilderIcon />,
      iconBg: "#fff8e1",
      iconColor: "#f9a825",
      valueColor: "#f9a825",
    },
    {
      labelKey: "dashboard.completedOrders",
      value: orderStatis?.complatedOrder,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },

    // ===== Items =====
    {
      labelKey: "dashboard.totalItems",
      value: productStatus[0]?.total,
      icon: <RestaurantMenuIcon />,
      iconBg: "#eef2ff",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
    },
    {
      labelKey: "dashboard.availableItems",
      value: productStatus[0]?.available,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },
    {
      labelKey: "dashboard.unavailableItems",
      value: productStatus[0]?.unavailable,
      icon: <CancelRoundedIcon />,
      iconBg: "#ffebee",
      iconColor: "#c62828",
      valueColor: "#c62828",
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
    },
    {
      labelKey: "dashboard.todayIncome",
      value: orderStatis?.todayIncomeAndAOV?.[0]?.totalSum ?? 0,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },
    {
      labelKey: "dashboard.avgOrderValue",
      value: orderStatis?.todayIncomeAndAOV?.[0]?.aovGross ?? 0,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
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
