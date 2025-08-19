import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Badge,
  Box,
  Button,
} from "@mui/material";

type NoticeType = "order" | "call" | "system";
type Notice = {
  id: string;
  type: NoticeType;
  text: string;
  time: string;
  read?: boolean;
};

const mockNotices: Notice[] = [
  { id: "n1", type: "order", text: "New order #1050 (T-09)", time: "2m" },
  { id: "n2", type: "call", text: "Table T-13 requested service", time: "5m" },
  { id: "n3", type: "system", text: "Receipt printer paper low", time: "12m" },
];

const colorByType = (t: NoticeType) =>
  t === "order" ? "primary" : t === "call" ? "error" : "info";

export default function NotificationsPanel({
  items = mockNotices,
  onMarkAllRead,
}: {
  items?: Notice[];
  onMarkAllRead?: () => void;
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        maxWidth: "100%",
        marginBottom: "30px",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="h3" fontWeight={"700"}>
            Notifications
          </Typography>
          <Button variant="contained" size="small" onClick={onMarkAllRead}>
            Mark all as read
          </Button>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1.5}>
          {items.map((n) => (
            <Stack
              key={n.id}
              direction="row"
              spacing={1.25}
              alignItems="center"
            >
              <Badge color={colorByType(n.type) as any} variant="dot">
                <Box sx={{ width: 4, height: 4 }} />
              </Badge>
              <Typography variant="h5" color={"text.primary"}>
                {n.text}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {n.time}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
