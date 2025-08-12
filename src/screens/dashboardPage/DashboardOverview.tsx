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

const kpis = [
  // ===== Orders =====
  {
    label: "Total Orders",
    value: 42,
    icon: <ReceiptLongIcon />,
    iconBg: "#e3f2fd",
    iconColor: "#1976d2",
    valueColor: "#1976d2",
  },
  {
    label: "Pending Orders",
    value: 7,
    icon: <QueryBuilderIcon />,
    iconBg: "#fff8e1",
    iconColor: "#f9a825",
    valueColor: "#f9a825",
  },
  {
    label: "Completed Orders",
    value: 31,
    icon: <CheckCircleIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
    valueColor: "#2e7d32",
  },

  // ===== Items =====
  {
    label: "Total Items",
    value: 120,
    icon: <RestaurantMenuIcon />,
    iconBg: "#eef2ff",
    iconColor: "#1e40af",
    valueColor: "#1e40af",
  },
  {
    label: "Available Items",
    value: 98,
    icon: <CheckCircleIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
    valueColor: "#2e7d32",
  },
  {
    label: "Unavailable Items",
    value: 22,
    icon: <CancelRoundedIcon />,
    iconBg: "#ffebee",
    iconColor: "#c62828",
    valueColor: "#c62828",
  },
  // ===== Tables =====
  {
    label: "Free Tables",
    value: "20",
    icon: <TableRestaurantIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
    valueColor: "#2e7d32",
  },
  {
    label: "Tables Occupied",
    value: "12",
    icon: <TableRestaurantIcon />,
    iconBg: "#ede7f6",
    iconColor: "#5e35b1",
    valueColor: "#5e35b1",
  },
  {
    label: "Cleaning Tables",
    value: 3,
    icon: <TableRestaurantIcon />,
    iconBg: "#fff8e1",
    iconColor: "#c62828",
    valueColor: "#c62828",
  },

  // ===== Other Metrics =====
  {
    label: "Call Waiter Requests",
    value: 3,
    icon: <NotificationsRoundedIcon />,
    iconBg: "#fff3e0",
    iconColor: "#ef6c00",
    valueColor: "#ef6c00",
  },
  {
    label: "Today's Income",
    value: "$1,280",
    icon: <MonetizationOnIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
    valueColor: "#2e7d32",
  },
  {
    label: "Avg Order Value",
    value: "$1,280",
    icon: <MonetizationOnIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#1e40af",
    valueColor: "#1e40af",
  },
];

function KpiItem({ label, value, icon, iconBg, iconColor, valueColor }: any) {
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
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function DashboardOverview() {
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
