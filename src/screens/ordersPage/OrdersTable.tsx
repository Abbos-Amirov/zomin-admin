import React, { ChangeEvent } from "react";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Button,
  Chip,
  Divider,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { retrieveOrders } from "./selector";
import {
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "../../lib/enums/order.enum";
import { dateFmt } from "../../lib/config";
import { Order, OrderInquiry, OrderUpdateInput } from "../../lib/types/order";

const ordersRetriever = createSelector(retrieveOrders, (orders) => ({
  orders,
}));

const typeColor = (t: OrderType) =>
  t === OrderType.TABLE
    ? "secondary"
    : t === OrderType.DELIVERY
    ? "info"
    : "warning";
const statusColor = (s: OrderStatus) =>
  s === OrderStatus.PENDING
    ? "warning"
    : s === OrderStatus.PROGRESS
    ? "info"
    : s === OrderStatus.COMPLETED
    ? "success"
    : "error";
const payStatusColor = (p: PaymentStatus) =>
  p === PaymentStatus.UNPAID
    ? "warning"
    : p === PaymentStatus.PAID
    ? "success"
    : "error";

interface OrderTableProps {
  orderSearch: OrderInquiry;
  setOrderSearch: (input: OrderInquiry) => void;
  setOpen: (open: boolean) => void;
  edit: OrderUpdateInput;
  setEdit: (edti: OrderUpdateInput) => void;
}

export default function OrdersTable(props: OrderTableProps) {
  const { orderSearch, setOrderSearch, setOpen, edit, setEdit } = props;

  const { orders } = useSelector(ordersRetriever);

  /** HANDLERS **/
  const paginationHandler = (e: ChangeEvent<any>, value: number) => {
    orderSearch.page = value;
    setOrderSearch({ ...orderSearch });
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Table</TableCell>
            <TableCell>Member</TableCell>
            <TableCell align="right">Subtotal</TableCell>
            <TableCell align="right">Delivery Fee</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Pay Method</TableCell>
            <TableCell>Pay Status</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((v) => {
            const grand = v.orderTotal - (v.deliveryFee || 0);
            return (
              <TableRow key={v._id} hover>
                <TableCell sx={{ fontFamily: "monospace" }}>
                  {v._id.slice(-8)}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={v.orderType}
                    color={typeColor(v.orderType) as any}
                  />
                </TableCell>
                <TableCell>{v.tableId ?? "-"}</TableCell>
                <TableCell>{v.memberId ?? "-"}</TableCell>
                <TableCell align="right">₩{grand}</TableCell>
                <TableCell align="right">₩{v.deliveryFee}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  ₩{v.orderTotal}
                </TableCell>
                <TableCell>{v.paymentMethod}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={v.paymentStatus}
                    color={payStatusColor(v.paymentStatus) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={v.orderStatus}
                    color={statusColor(v.orderStatus) as any}
                  />
                </TableCell>
                <TableCell>{dateFmt(v.createdAt)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setOpen(true);
                      setEdit({
                        orderId: v._id,
                        orderStatus: v.orderStatus,
                        paymentStatus: v.paymentStatus,
                        paymentMethod: v.paymentMethod,
                      });
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={12}>No orders</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Divider />
      <Stack className="pagination-section">
        <Stack spacing={2}>
          <Pagination
            count={
              orders.length !== 0 ? orderSearch.page + 1 : orderSearch.page
            }
            page={orderSearch.page}
            renderItem={(item) => (
              <PaginationItem
                slots={{
                  previous: ArrowBackIcon,
                  next: ArrowForwardIcon,
                }}
                {...item}
                color={"secondary"}
              />
            )}
            onChange={paginationHandler}
          />
        </Stack>
      </Stack>
    </TableContainer>
  );
}
