import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { OrderStatus, PaymentMethod, PaymentStatus, OrderType } from "./types";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  type: OrderType | "ALL";
  onTypeChange: (v: OrderType | "ALL") => void;
  status: OrderStatus | "ALL";
  onStatusChange: (v: OrderStatus | "ALL") => void;
  payStatus: PaymentStatus | "ALL";
  onPayStatusChange: (v: PaymentStatus | "ALL") => void;
  payMethod: PaymentMethod | "ALL";
  onPayMethodChange: (v: PaymentMethod | "ALL") => void;
};

export default function OrdersFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  payStatus,
  onPayStatusChange,
  payMethod,
  onPayMethodChange,
}: Props) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          size="small"
          label="Search (ID / table / member)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <Box flex={1} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as any)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="TABLE">TABLE</MenuItem>
            <MenuItem value="DELIVERY">DELIVERY</MenuItem>
            <MenuItem value="TAKEOUT">TAKEOUT</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="PROGRESS">PROGRESS</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            label="Payment Status"
            value={payStatus}
            onChange={(e) => onPayStatusChange(e.target.value as any)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="UNPAID">UNPAID</MenuItem>
            <MenuItem value="PAID">PAID</MenuItem>
            <MenuItem value="REFUNDED">REFUNDED</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Method</InputLabel>
          <Select
            label="Method"
            value={payMethod}
            onChange={(e) => onPayMethodChange(e.target.value as any)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="CASH">CASH</MenuItem>
            <MenuItem value="CARD">CARD</MenuItem>
            <MenuItem value="TRANSFER">TRANSFER</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
