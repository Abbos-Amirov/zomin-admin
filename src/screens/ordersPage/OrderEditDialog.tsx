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
} from "@mui/material";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../lib/enums/order.enum";
import { OrderInquiry, OrderUpdateInput } from "../../lib/types/order";
import {
  sweetCenterSuccessAlert,
  sweetErrorHandling,
} from "../../lib/sweetAlert";
import OrderService from "../../services/Order.service";
import { Messages } from "../../lib/config";

interface OrderEditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  edit: OrderUpdateInput;
  setEdit: (edit: OrderUpdateInput) => void;
  orderSearch: OrderInquiry;
  setOrderSearch: (input: OrderInquiry) => void;
}

export default function OrderEditDialog(props: OrderEditDialogProps) {
  const { open, setOpen, edit, setEdit, orderSearch, setOrderSearch } = props;

  /** HANDLERS **/
  const onUpdateHandler = async (input: OrderUpdateInput) => {
    try {
      if (
        edit.orderId === "" ||
        edit.orderStatus === null ||
        edit.paymentStatus === null ||
        edit.paymentMethod === null
      )
        throw Error(Messages.error3);
      const order = new OrderService();
      await order.updateChosenOrder(input);
      setOrderSearch({ ...orderSearch });
      setOpen(false);
      sweetCenterSuccessAlert("updated!", 700);
    } catch (err) {
      console.log(err);
      setOpen(false);
      sweetErrorHandling(err).then();
    }
  };
  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"700"}>
        Edit Order {edit?.orderId.slice(-8)}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <FormControl size="small">
            <InputLabel>Order Status</InputLabel>
            <Select
              label="Order Status"
              value={edit.orderStatus}
              onChange={(e) => {
                if (edit)
                  setEdit({
                    ...edit,
                    orderStatus: e.target.value as OrderStatus,
                  });
              }}
            >
              <MenuItem value={OrderStatus.PENDING}>PENDING</MenuItem>
              <MenuItem value={OrderStatus.PROGRESS}>PROGRESS</MenuItem>
              <MenuItem value={OrderStatus.COMPLETED}>COMPLETED</MenuItem>
              <MenuItem value={OrderStatus.CANCELLED}>CANCELLED</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Payment Status</InputLabel>
            <Select
              label="Payment Status"
              value={edit.paymentStatus}
              onChange={(e) => {
                if (edit)
                  setEdit({
                    ...edit,
                    paymentStatus: e.target.value as PaymentStatus,
                  });
              }}
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
              value={edit.paymentMethod}
              onChange={(e) => {
                if (edit)
                  setEdit({
                    ...edit,
                    paymentMethod: e.target.value as PaymentMethod,
                  });
              }}
            >
              <MenuItem value="CASH">CASH</MenuItem>
              <MenuItem value="CARD">CARD</MenuItem>
              <MenuItem value="TRANSFER">TRANSFER</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => onUpdateHandler(edit)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
