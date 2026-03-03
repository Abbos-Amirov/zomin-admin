import DashboardOverview from "./DashboardOverview";
import TopItemAndCategory from "./topItemAndCategory";
import QuickActions from "./QuickActions";
import { useDispatch } from "react-redux";
import { OrderStatis } from "../../lib/types/order";
import { setOrderStatis, setProductStatus, setTableStatus } from "./slice";
import { Table, TableInquiry } from "../../lib/types/table";
import { Dispatch } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { ProductsStat } from "../../lib/types/product";
import OrderService from "../../services/Order.service";
import ProductService from "../../services/Product.service";
import TableService from "../../services/Table.service";
import TableInfo from "./TableStatus";
import TableStatusTop from "./TableStatusTop";

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
  const [inquiry, setInquiry] = useState<TableInquiry>({
    limit: 1000,
    page: 1,
  });

  useEffect(() => {
    const order = new OrderService();
    order
      .getOrderStatis()
      .then((data) => {
        setOrderStatis(data);
      })
      .catch((err) => console.warn("getOrderStatis:", err));

    const product = new ProductService();
    product
      .getProductsStat()
      .then((data) => setProductStatus(data))
      .catch((err) => console.warn("getProductsStat:", err));

    const table = new TableService();
    table
      .getAllTables(inquiry)
      .then((data) => setTableStatus(data))
      .catch((err) => console.warn("getAllTables:", err));
  }, [inquiry]);
  return (
    <>
      <DashboardOverview />
      <TableStatusTop />
      <TableInfo inquiry={inquiry} setInquiry={setInquiry} />
      <TopItemAndCategory />
      <QuickActions />
    </>
  );
}
