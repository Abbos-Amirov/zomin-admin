import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
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
    <Stack
      flexDirection={"row"}
      marginTop={"30px"}
      justifyContent={"space-around"}
      padding={"10px"}
    >
      <Button
        startIcon={<AddRoundedIcon />}
        variant="contained"
        onClick={onNewOrder}
      >
        New Order
      </Button>
      <Button
        startIcon={<TableRestaurantIcon />}
        variant="contained"
        onClick={onAssignTable}
      >
        Assign Table
      </Button>
      <Button
        startIcon={<CleaningServicesRoundedIcon />}
        variant="contained"
        onClick={onMarkCleaned}
      >
        Mark Table Cleaned
      </Button>
      <Button
        startIcon={<NotificationsNoneRoundedIcon />}
        variant="contained"
        onClick={onMarkAllNoticesRead}
      >
        Mark Notices Read
      </Button>
    </Stack>
  );
}
