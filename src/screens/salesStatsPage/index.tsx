import React, { useCallback, useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TodayIcon from "@mui/icons-material/Today";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OrderService from "../../services/Order.service";
import { Order } from "../../lib/types/order";

type SalesPeriod = "all" | "year" | "month" | "week" | "today7";

const getToday7AM = (): Date => {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  return d;
};

const sumByPeriod = (orders: Order[], period: SalesPeriod): number => {
  const now = new Date();
  const today7 = getToday7AM();

  const toMs = (d: Date) => d.getTime();
  const orderDate = (o: Order) => new Date((o as any).createdAt ?? o.createdAt).getTime();

  return orders.reduce((sum, o) => {
    const total = Number((o as any).orderTotal ?? o.orderTotal ?? 0) || 0;
    const od = orderDate(o);

    if (period === "all") return sum + total;

    if (period === "year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      if (od >= toMs(yearAgo)) return sum + total;
      return sum;
    }

    if (period === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (od >= toMs(monthAgo)) return sum + total;
      return sum;
    }

    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (od >= toMs(weekAgo)) return sum + total;
      return sum;
    }

    if (period === "today7") {
      if (od >= toMs(today7)) return sum + total;
      return sum;
    }

    return sum;
  }, 0);
};

export default function SalesStatsPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const svc = new OrderService();
      const data = await svc.getOrdersForStats();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cards: { period: SalesPeriod; labelKey: string; icon: React.ReactNode; iconBg: string; iconColor: string }[] = [
    {
      period: "all",
      labelKey: "sales.totalSales",
      icon: <TrendingUpIcon />,
      iconBg: "#e3f2fd",
      iconColor: "#1565c0",
    },
    {
      period: "year",
      labelKey: "sales.lastYear",
      icon: <CalendarMonthIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
    },
    {
      period: "month",
      labelKey: "sales.lastMonth",
      icon: <DateRangeIcon />,
      iconBg: "#fff3e0",
      iconColor: "#e65100",
    },
    {
      period: "week",
      labelKey: "sales.lastWeek",
      icon: <TodayIcon />,
      iconBg: "#f3e5f5",
      iconColor: "#7b1fa2",
    },
    {
      period: "today7",
      labelKey: "sales.todayAfter7",
      icon: <AccessTimeIcon />,
      iconBg: "#e0f7fa",
      iconColor: "#00838f",
    },
  ];

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        {t("sales.title")}
      </Typography>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {cards.map((c) => {
            const value = sumByPeriod(orders, c.period);
            return (
              <Grid item xs={12} sm={6} md={4} key={c.period}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: c.iconBg, color: c.iconColor }}>{c.icon}</Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t(c.labelKey)}
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                      ₩{Number(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
