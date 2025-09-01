import React from "react";
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

function KpiItem({ label, value, icon, iconBg, iconColor, valueColor }: any) {
  const isMoney = label === "Today's Income" || label === "Avg Order Value";
  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: 1,
        border: (t) => `1px solid ${t.palette.divider}`,
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{ bgcolor: iconBg, color: iconColor, width: 40, height: 40 }}
          >
            {icon}
          </Avatar>
          <Typography variant="h4" color="text.primary">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} sx={{ color: valueColor }}>
          {isMoney ? `$${Number(value).toFixed(1)}` : value}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function DashboardOverview() {
  const { orderStatis } = useSelector(orderStatisRetriever);
  const { productStatus } = useSelector(productStatusRetriever);
  const { tableStatus } = useSelector(tableStatusRetriever);
  const kpis = [
    // ===== Orders =====
    {
      label: "Total Orders",
      value: orderStatis?.totalOrder,
      icon: <ReceiptLongIcon />,
      iconBg: "#e3f2fd",
      iconColor: "#1976d2",
      valueColor: "#1976d2",
    },
    {
      label: "Pending Orders",
      value: orderStatis?.pendingOrder,
      icon: <QueryBuilderIcon />,
      iconBg: "#fff8e1",
      iconColor: "#f9a825",
      valueColor: "#f9a825",
    },
    {
      label: "Completed Orders",
      value: orderStatis?.complatedOrder,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },

    // ===== Items =====
    {
      label: "Total Items",
      value: productStatus[0]?.total,
      icon: <RestaurantMenuIcon />,
      iconBg: "#eef2ff",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
    },
    {
      label: "Available Items",
      value: productStatus[0]?.available,
      icon: <CheckCircleIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },
    {
      label: "Unavailable Items",
      value: productStatus[0]?.unavailable,
      icon: <CancelRoundedIcon />,
      iconBg: "#ffebee",
      iconColor: "#c62828",
      valueColor: "#c62828",
    },
    // ===== Tables =====
    {
      label: "Free Tables",
      value: tableStatus?.filter(
        (val) => val.tableStatus === TableStatus.AVAILABLE
      ).length,
      icon: <TableRestaurantIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },
    {
      label: "Tables Occupied",
      value: tableStatus?.filter(
        (val) => val.tableStatus === TableStatus.OCCUPIED
      ).length,
      icon: <TableRestaurantIcon />,
      iconBg: "#ede7f6",
      iconColor: "#5e35b1",
      valueColor: "#5e35b1",
    },
    {
      label: "Cleaning Tables",
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
      label: "Call Waiter Requests",
      value: tableStatus?.filter((val) => val.tableCall === TableCall.ACTIVE)
        .length,
      icon: <NotificationsRoundedIcon />,
      iconBg: "#fff3e0",
      iconColor: "#ef6c00",
      valueColor: "#ef6c00",
    },
    {
      label: "Today's Income",
      value: orderStatis?.todayIncomeAndAOV[0]?.totalSum,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
      valueColor: "#2e7d32",
    },
    {
      label: "Avg Order Value",
      value: orderStatis?.todayIncomeAndAOV[0]?.aovGross,
      icon: <MonetizationOnIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#1e40af",
      valueColor: "#1e40af",
    },
  ];
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: "#ede7f6",
                color: "#5e35b1",
                width: 40,
                height: 40,
              }}
            >
              <DashboardCustomizeRoundedIcon />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Dashboard Overview
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {kpis.map((k) => (
              <Grid item xs={12} sm={6} md={4} key={k.label}>
                <KpiItem {...k} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
