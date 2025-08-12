import * as React from "react";
import { Card, CardContent, Typography, Stack, Divider, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import CleaningServicesRoundedIcon from "@mui/icons-material/CleaningServicesRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

type Props = {
  onNewOrder?: () => void;
  onAssignTable?: () => void;
  onMarkCleaned?: () => void;
  onMarkAllNoticesRead?: () => void;
};

export default function QuickActions({
  onNewOrder,
  onAssignTable,
  onMarkCleaned,
  onMarkAllNoticesRead,
}: Props) {
  return (
    <Card sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="h6" mb={1}>Quick Actions</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button startIcon={<AddRoundedIcon />} variant="contained" onClick={onNewOrder}>
            New Order
          </Button>
          <Button startIcon={<TableRestaurantIcon />} variant="outlined" onClick={onAssignTable}>
            Assign Table
          </Button>
          <Button startIcon={<CleaningServicesRoundedIcon />} variant="outlined" onClick={onMarkCleaned}>
            Mark Table Cleaned
          </Button>
          <Button startIcon={<NotificationsNoneRoundedIcon />} variant="text" onClick={onMarkAllNoticesRead}>
            Mark Notices Read
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
