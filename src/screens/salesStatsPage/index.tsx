import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
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
import type { PaidOrderSummary } from "../../lib/types/order";
import {
  computePaidTotalsFromOrders,
  mergePaidSummaryWithComputed,
} from "../../lib/utils/paidOrdersClientTotals";

type SummaryKey = keyof PaidOrderSummary;

export default function SalesStatsPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<PaidOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const svc = new OrderService();
      const [apiSummary, orders] = await Promise.all([
        svc.getPaidOrderSummary(),
        svc.getOrdersForStats(),
      ]);
      const computed = computePaidTotalsFromOrders(orders);
      setSummary(mergePaidSummaryWithComputed(apiSummary, computed));
    } catch {
      setSummary({
        totalSum: 0,
        yearSum: 0,
        monthSum: 0,
        weekSum: 0,
        todaySum: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const cards: {
    key: SummaryKey;
    labelKey: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      key: "totalSum",
      labelKey: "sales.totalSales",
      icon: <TrendingUpIcon />,
      iconBg: "#e3f2fd",
      iconColor: "#1565c0",
    },
    {
      key: "yearSum",
      labelKey: "sales.lastYear",
      icon: <CalendarMonthIcon />,
      iconBg: "#e8f5e9",
      iconColor: "#2e7d32",
    },
    {
      key: "monthSum",
      labelKey: "sales.lastMonth",
      icon: <DateRangeIcon />,
      iconBg: "#fff3e0",
      iconColor: "#e65100",
    },
    {
      key: "weekSum",
      labelKey: "sales.lastWeek",
      icon: <TodayIcon />,
      iconBg: "#f3e5f5",
      iconColor: "#7b1fa2",
    },
    {
      key: "todaySum",
      labelKey: "sales.todayAfter7",
      icon: <AccessTimeIcon />,
      iconBg: "#e0f7fa",
      iconColor: "#00838f",
    },
  ];

  const fmt = (n: number) =>
    `₩${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        {t("sales.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("sales.subtitleFromApi")}
      </Typography>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {cards.map((c) => {
            const value = summary?.[c.key] ?? 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={c.key}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: c.iconBg, color: c.iconColor }}>{c.icon}</Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t(c.labelKey)}
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                      {fmt(value)}
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
