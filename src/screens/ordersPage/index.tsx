import React, { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";
import OrderEditDialog from "./OrderEditDialog";
import { Order, OrderInquiry, OrderUpdateInput } from "../../lib/types/order";
import { setOrders } from "./slice";
import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import OrderService from "../../services/Order.service";
import { sweetErrorHandling } from "../../lib/sweetAlert";
import "../../css/orders.css"

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setOrders: (data: Order[]) => dispatch(setOrders(data)),
});

export default function OrdersPage() {
  const { setOrders } = actionDispatch(useDispatch());

  const [open, setOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<OrderUpdateInput>({ orderId: "" });
  const [orderSearch, setOrderSearch] = useState<OrderInquiry>({
    page: 1,
    limit: 10,
    search: "",
  });

  useEffect(() => {
    const order = new OrderService();
    order
      .getAllOrders(orderSearch)
      .then((data) => setOrders(data))
      .catch((err) => {
        console.log(err);
        sweetErrorHandling(err).then();
      });
  }, [orderSearch]);

  return (
    <Stack spacing={2} className="order-page">
      <Typography variant="h3" fontWeight={700} textAlign={"center"}>
        Orders
      </Typography>

      <OrdersFilters
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
      />

      <OrdersTable
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
        setOpen={setOpen}
        edit={edit}
        setEdit={setEdit}
      />

      <OrderEditDialog
        open={open}
        setOpen={setOpen}
        edit={edit}
        setEdit={setEdit}
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
      />
    </Stack>
  );
}
