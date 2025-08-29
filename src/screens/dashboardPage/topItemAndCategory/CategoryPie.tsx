import React from "react";
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

ChartJS.register(ArcElement, Tooltip, Legend);

const categories = ["Dish", "Salad", "Drink", "Dessert"];
const values = [22, 56, 12, 10];

const categoryColors: any = {
  Dish: {
    bg: "#ff7043",
    border: "#d84315",
  },
  Salad: {
    bg: "#66bb6a",
    border: "#2e7d32",
  },
  Drink: {
    bg: "#42a5f5",
    border: "#1565c0",
  },
  Dessert: {
    bg: "#ba68c8",
    border: "#6a1b9a",
  },
};

export default function CategoryPie() {
  const data = {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: categories.map((cat) => categoryColors[cat].bg),
        borderColor: categories.map((cat) => categoryColors[cat].border),
        borderWidth: 0,
      },
    ],
  };

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
          Orders by Category
        </Typography>
        <Divider sx={{ mb: 2 }} />
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
                borderColor: categoryColors[val].bg,
                color: categoryColors[val].border,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
