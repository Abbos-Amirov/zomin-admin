import React from "react";
import { Stack, Box } from "@mui/material";
import NotificationsPanel from "./NotificationsPanel";
import CategoryPie from "./CategoryPie";
import TopItemsBar from "./TopItemsBar";

export default function index() {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
    >
      <Box
        sx={{
          flex: { xs: "1 1", md: "2 1 0" },
          minWidth: 0,
        }}
      >
        <TopItemsBar/>
      </Box>

      <Box
        sx={{
          flex: { xs: "1 1", md: "1 1 0" },
          minWidth: 0,
        }}
      >
        <CategoryPie />
      </Box>
    </Stack>
  );
}
