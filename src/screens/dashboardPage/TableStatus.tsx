// TableStatus.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Grid,
  Box,
  Avatar,
  Badge,
  Button,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CleaningServicesRoundedIcon from "@mui/icons-material/CleaningServicesRounded";
import { RippleBadge } from "../../app/MaterialTheme/styled";

type TableState = "free" | "occupied" | "cleaning";

type TableInfo = {
  id: number;
  name: string;
  state: TableState;
  call?: boolean; // call waiter
};

const tables: TableInfo[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: `T-${String(i + 1).padStart(2, "0")}`,
  state: i % 5 === 0 ? "cleaning" : i % 3 === 0 ? "occupied" : "free",
  call: i === 6 || i === 13,
}));

const bgByState = (s: TableState) =>
  s === "occupied"
    ? "warning.light"
    : s === "cleaning"
    ? "info.light"
    : "background.default";

export default function TableStatus() {
  return (
    <Card sx={{ borderRadius: 3, maxHeight: "100%", marginBottom: "30px" }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
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
                width: 36,
                height: 36,
              }}
            >
              <TableRestaurantIcon />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Table Status
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} color="text.primary">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "warning.light",
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Occupied</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "info.light",
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Cleaning</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "background.default",
                  border: (t) => `3px solid ${t.palette.divider}`,
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Free</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={1.5}>
          {tables.map((t) => (
            <Grid item xs={4} sm={3} md={2.4 as any} lg={2} key={t.id}>
              <Box
                sx={{
                  height: "150px",
                  p: 1.5,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: bgByState(t.state)
                }}
              >
                <Stack
                  height={"100%"}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack>
                    <Typography variant="h3" fontWeight={700}>
                      {t.name}
                    </Typography>
                    <Typography variant="h4" color="text.primary">
                      {t.state}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {t.call && (
                      <Button>
                        <RippleBadge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          variant="dot"
                          color="error"
                        >
                          <NotificationsRoundedIcon fontSize="large" />
                        </RippleBadge>
                      </Button>
                    )}
                    <Avatar sx={{ width: 50, height: 50 }}>
                      {t.state === "cleaning" ? (
                        <CleaningServicesRoundedIcon fontSize="large" />
                      ) : (
                        <TableRestaurantIcon fontSize="large" />
                      )}
                    </Avatar>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
