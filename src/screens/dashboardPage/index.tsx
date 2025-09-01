import DashboardOverview from "./DashboardOverview";
import TopItemAndCategory from "./topItemAndCategory";
import QuickActions from "./QuickActions";
import { useDispatch } from "react-redux";
import { OrderStatis } from "../../lib/types/order";
import { setOrderStatis, setProductStatus, setTableStatus } from "./slice";
import { Table } from "../../lib/types/table";
import { Dispatch } from "@reduxjs/toolkit";
import { useEffect } from "react";
import TableStatus from "./TableStatus";
import { ProductsStat } from "../../lib/types/product";
import OrderService from "../../services/Order.service";
import ProductService from "../../services/Product.service";
import TableService from "../../services/Table.service";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setOrderStatis: (data: OrderStatis) => dispatch(setOrderStatis(data)),
  setTableStatus: (data: Table[]) => dispatch(setTableStatus(data)),
  setProductStatus: (data: ProductsStat[]) => dispatch(setProductStatus(data)),
});

export default function DashboardPage() {
  const { setOrderStatis, setTableStatus, setProductStatus } = actionDispatch(
    useDispatch()
  );

  useEffect(() => {
    const order = new OrderService();
    order
      .getOrderStatis()
      .then((data) => {
        setOrderStatis(data);
      })
      .catch((err) => console.log(err));

    const product = new ProductService();
    product
      .getProductsStat()
      .then((data) => {
        setProductStatus(data);
      })
      .catch((err) => console.log(err));

    const table = new TableService();
    table
      .getAllTables({
        limit: 10000,
        page: 1,
      })
      .then((data) => {
        setTableStatus(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <>
      <DashboardOverview />
      <TableStatus />
      <TopItemAndCategory />
      <QuickActions />
    </>
  );
}

function state(state: unknown): unknown {
  throw new Error("Function not implemented.");
}
