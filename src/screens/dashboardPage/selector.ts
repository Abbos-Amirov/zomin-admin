import { createSelector } from "reselect";
import { AppRootState } from "../../lib/types/screen";

const selectDashboardPage = (state: AppRootState) => state.dashboardPage;

export const retrieveOrderStatis = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.orderStatis
);

export const retrieveTableStatus = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.tableStatus
);

export const retrieveProductStatus = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.productStatus
);
