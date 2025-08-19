import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from "./types";

type Props = {
  order: Order | null;
  onClose: () => void;
  onSave: (patch: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
  }) => void;
};

export default function OrderEditDialog({ order, onClose, onSave }: Props) {
  const [status, setStatus] = React.useState<OrderStatus>("PENDING");
  const [payStatus, setPayStatus] = React.useState<PaymentStatus>("UNPAID");
  const [payMethod, setPayMethod] = React.useState<PaymentMethod>("CARD");

  React.useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
      setPayStatus(order.paymentStatus);
      setPayMethod(order.paymentMethod);
    }
  }, [order]);

  if (!order) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"700"}>Edit Order {order._id.slice(-8)}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2">
            Note: {order.orderNote || "-"}
          </Typography>

          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="PROGRESS">PROGRESS</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Payment Status</InputLabel>
            <Select
              label="Payment Status"
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}
            >
              <MenuItem value="UNPAID">UNPAID</MenuItem>
              <MenuItem value="PAID">PAID</MenuItem>
              <MenuItem value="REFUNDED">REFUNDED</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Payment Method</InputLabel>
            <Select
              label="Payment Method"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
            >
              <MenuItem value="CASH">CASH</MenuItem>
              <MenuItem value="CARD">CARD</MenuItem>
              <MenuItem value="TRANSFER">TRANSFER</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            onSave({
              orderStatus: status,
              paymentStatus: payStatus,
              paymentMethod: payMethod,
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
