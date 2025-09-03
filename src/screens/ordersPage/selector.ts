import { createSelector } from "reselect";
import { AppRootState } from "../../lib/types/screen";

const selectOrdersPage = (state: AppRootState) => state.ordersPage;

export const retrieveOrders = createSelector(
  selectOrdersPage,
  (ordersPage) => ordersPage.orders
);

