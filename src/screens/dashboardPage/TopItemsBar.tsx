import React from "react";
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const labels = ["Burger", "Pizza", "Pasta", "Salad", "Sushi", "Fries"];
const dataValues = [120, 98, 86, 64, 52, 49];

export default function TopItemsBar() {
  const data = {
    labels,
    datasets: [
      {
        label: "Orders (this week)",
        data: dataValues,
        // no explicit color -> Chart.js will auto-pick; keep it simple
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 20 } },
    },
  };

  return (
    <Card sx={{ borderRadius: 3, height: 360 }}>
      <CardContent sx={{ height: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
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
