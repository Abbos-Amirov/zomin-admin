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
}

/** DashboardPage */
export interface DashboardPageState {
  orderStatis: OrderStatis | null;
  tableStatus: Table[];
  productStatus: ProductsStat[];
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
