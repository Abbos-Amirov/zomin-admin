import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { createSelector } from "@reduxjs/toolkit";
import { retrieveOrderStatis } from "../selector";
import { useSelector } from "react-redux";

const orderStatisRetriever = createSelector(
  retrieveOrderStatis,
  (orderStatis) => ({ orderStatis })
);

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors: Record<string, { bg: string; border: string }> = {
  DISH: { bg: "#ff7043", border: "#d84315" },
  SALAD: { bg: "#66bb6a", border: "#2e7d32" },
  DRINK: { bg: "#42a5f5", border: "#1565c0" },
  DESSERT: { bg: "#ba68c8", border: "#6a1b9a" },
  OTHER: { bg: "#e0e0e0", border: "#9e9e9e" },
};

function getCatColors(cat: string) {
  const key = String(cat || "OTHER").toUpperCase();
  return categoryColors[key] ?? categoryColors.OTHER;
}

export default function CategoryPie() {
  const { t } = useTranslation();
  const { orderStatis } = useSelector(orderStatisRetriever);

  const rows = orderStatis?.ordersByCategory ?? [];
  const categories = rows.map((val) => val.collection);
  /** Backend ba'zan `orders` 0 qaytaradi, `totalQuantity` yoki `revenue` bo‘lishi mumkin */
  const values = rows.map((val) => {
    const o = Number(val.orders ?? 0) || 0;
    const q = Number(val.totalQuantity ?? 0) || 0;
    const r = Number(val.revenue ?? 0) || 0;
    return o > 0 ? o : q > 0 ? q : r > 0 ? r : 0;
  });
  const hasData = categories.length > 0 && values.some((v) => Number(v) > 0);

  const data = useMemo(
    () => ({
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: categories.map((cat) => getCatColors(cat).bg),
          borderColor: categories.map((cat) => getCatColors(cat).border),
          borderWidth: 0,
        },
      ],
    }),
    [categories, values]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: { enabled: true },
    },
    cutout: "60%",
  };

  return (
    <Card sx={{ borderRadius: 3, height: 360 }}>
      <CardContent sx={{ height: 1 }}>
        <Typography variant="h5" fontWeight={"700"} sx={{ mb: 1 }}>
          {t("dashboard.ordersByCategory")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {!hasData ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center", px: 2 }}>
            {t("dashboard.chartNoData")}
          </Typography>
        ) : (
          <>
            <div style={{ height: 220 }}>
              <Doughnut data={data} options={options} />
            </div>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
              {categories.map((val) => (
                <Chip
                  key={val}
                  size="small"
                  label={val}
                  variant="outlined"
                  sx={{
                    borderColor: getCatColors(val).bg,
                    color: getCatColors(val).border,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
