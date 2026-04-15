import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, Typography, Divider } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { createSelector } from "@reduxjs/toolkit";
import { retrieveOrderStatis } from "../selector";
import { useSelector } from "react-redux";

/** REDUX SLICE & SELECTOR */
const orderStatisRetriever = createSelector(
  retrieveOrderStatis,
  (orderStatis) => ({ orderStatis })
);

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TopItemsBar() {
  const { t } = useTranslation();
  const { orderStatis } = useSelector(orderStatisRetriever);

  const items = orderStatis?.topSellingItems ?? [];
  const allLabels = items.map((val) => val.productName || val.productId || "—");
  const allValues = items.map((val) => val.totalQuantity);

  const labels = allLabels.slice(0, 6);
  const values = allValues.slice(0, 6);
  const hasData = labels.length > 0 && values.some((v) => Number(v) > 0);

  const bgColors = [
    "#42A5F5",
    "#FF7043",
    "#66BB6A",
    "#AB47BC",
    "#26C6DA",
    "#FFA726",
  ];

  const borderColors = [
    "#1E88E5",
    "#F4511E",
    "#2E7D32",
    "#8E24AA",
    "#00838F",
    "#EF6C00",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: t("dashboard.topSellingItems"),
        data: values,
        backgroundColor: bgColors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 0,
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y} ${t("dashboard.ordersUnit")}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <Card sx={{ borderRadius: 3, height: 360 }}>
      <CardContent sx={{ height: 1 }}>
        <Typography variant="h4" fontWeight={"700"} sx={{ mb: 1 }}>
          {t("dashboard.topSellingItems")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {!hasData ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center", px: 2 }}>
            {t("dashboard.chartNoData")}
          </Typography>
        ) : (
          <div style={{ height: 260 }}>
            <Bar data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
