import type { LinkDineInOrderView } from "../linkDineInOrderMapping";
import { Member } from "./member";
import { Order, OrderStatis } from "./order";
import { Product, ProductsStat } from "./product";
import { Table } from "./table";

/** REACT APP STORE */
export interface AppRootState {
  dashboardPage: DashboardPageState;
  menuPage: MenuPageState;
  ordersPage: OrdersPageState;
  usersPage: UsersPageState;
  tablesPage: TablesPageState;
}

/** DashboardPage */
export interface DashboardPageState {
  orderStatis: OrderStatis | null;
  tableStatus: Table[];
  productStatus: ProductsStat[];
  /** Link o'tirib yeyish: qabul kutilayotgan buyurtma IDlari (badge — sidebar / topbar; sahifadan chiqilsa ham saqlanadi) */
  linkDinePendingAckIds: string[];
  linkDineInOrders: LinkDineInOrderView[];
  linkDineAlertOpen: boolean;
  linkDineAlertOrders: LinkDineInOrderView[];
}

/** MenuPage */
export interface MenuPageState {
  products: Product[];
}

/** OrdersPage */
export interface OrdersPageState {
  orders: Order[];
}

/** UsersPage **/
export interface UsersPageState {
  users: Member[];
}

/** TablePage **/
export interface TablesPageState {
  tables: Table[];
}
