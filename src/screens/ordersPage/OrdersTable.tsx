import React from "react";
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
import { Order, OrderStatus, OrderType, PaymentStatus } from "./types";

const money = (n: number) => new Intl.NumberFormat().format(n);
const dateFmt = (iso: string) => new Date(iso).toLocaleString();

const typeColor = (t: OrderType) =>
  t === "TABLE" ? "secondary" : t === "DELIVERY" ? "info" : "warning";
const statusColor = (s: OrderStatus) =>
  s === "PENDING"
    ? "warning"
    : s === "PROGRESS"
    ? "info"
    : s === "COMPLETED"
    ? "success"
    : "error";
const payStatusColor = (p: PaymentStatus) =>
  p === "UNPAID" ? "warning" : p === "PAID" ? "success" : "error";

type Props = {
  rows: Order[];
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onEdit: (o: Order) => void;
};

export default function OrdersTable({
  rows,
  page,
  limit,
  onPageChange,
  onEdit,
}: Props) {
  const totalPages = Math.max(3, Math.ceil(rows.length / limit));
  const start = (page - 1) * limit;
  const paged = rows.slice(start, start + limit);

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
          {paged.map((v) => {
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
                <TableCell align="right">₩{money(grand)}</TableCell>
                <TableCell align="right">₩{money(v.deliveryFee)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  ₩{money(v.orderTotal)}
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
                    onClick={() => onEdit(v)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={12}>No orders</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Divider />
      <Stack direction="row" justifyContent="center" p={2} margin={"20px"}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, p) => onPageChange(p)}
          size="medium"
          color="secondary"
        />
      </Stack>
    </TableContainer>
  );
}
