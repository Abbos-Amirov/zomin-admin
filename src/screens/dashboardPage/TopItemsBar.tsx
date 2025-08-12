import React from "react";
import { Card, CardContent, Typography, Divider, colors } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function TopItemsBar() {
  // Hard-coded data (more than 6 — we’ll slice to 6)
  const allLabels = [
    "Burger",
    "Pizza",
    "Pasta",
    "Salad",
    "Sushi",
    "Fries",
    "Steak",
  ];
  const allValues = [120, 98, 86, 64, 52, 49, 41];

  const labels = allLabels.slice(0, 6);
  const values = allValues.slice(0, 6);

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
        label: "Orders (this week)",
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
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
          label: (ctx: any) => `${ctx.parsed.y} orders`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 20 } },
    },
  };

  return (
    <Card sx={{ borderRadius: 3, height: 360, marginTop: "30px" }}>
      <CardContent sx={{ height: 1 }}>
        <Typography variant="h4" fontWeight={"700"} sx={{ mb: 1 }}>
          Top Selling Items
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <div style={{ height: 260 }}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
