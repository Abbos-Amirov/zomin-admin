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

export const retrieveLinkDinePendingAckIds = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.linkDinePendingAckIds ?? []
);

export const retrieveLinkDinePendingAckCount = createSelector(
  retrieveLinkDinePendingAckIds,
  (ids) => ids.length
);

export const retrieveLinkDineInOrders = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.linkDineInOrders ?? []
);

export const retrieveLinkDineAlertOpen = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.linkDineAlertOpen ?? false
);

export const retrieveLinkDineAlertOrders = createSelector(
  selectDashboardPage,
  (dashboardPage) => dashboardPage.linkDineAlertOrders ?? []
);
