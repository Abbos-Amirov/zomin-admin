import { OrdersByCategory, OrderStatis, TopSellingItems } from "./order";
import { Table } from "./table";

/** REACT APP STORE */
export interface AppRootState {
  dashboardPage: DashboardPageState;
}

/** DashboardPage */
export interface DashboardPageState {
  orderStatis: OrderStatis | null;
  tableStatus: Table[];
  topSellingItems: TopSellingItems[];
  ordersByCategory: OrdersByCategory[];
}
