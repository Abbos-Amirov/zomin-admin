import { OrdersByCategory, OrderStatis, TopSellingItems } from "./order";
import { Product, ProductsStat } from "./product";
import { Table } from "./table";

/** REACT APP STORE */
export interface AppRootState {
  dashboardPage: DashboardPageState;
  menuPage: MenuPageState;
}

/** DashboardPage */
export interface DashboardPageState {
  orderStatis: OrderStatis | null;
  tableStatus: Table[];
  productStatus: ProductsStat[];
}

/** MenuPage */
export interface MenuPageState{
  products: Product[];
}
