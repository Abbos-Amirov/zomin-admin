import React from "react";
import { Stack, Box } from "@mui/material";
import NotificationsPanel from "./NotificationsPanel";
import CategoryPie from "./CategoryPie";

export default function NotifAndCategory() {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{ width: "100%" }}
    >
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "2 1 0" },
          minWidth: 0,
        }}
      >
        <NotificationsPanel />
      </Box>

      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "1 1 0" },
          minWidth: 0,
        }}
      >
        <CategoryPie />
      </Box>
    </Stack>
  );
}
