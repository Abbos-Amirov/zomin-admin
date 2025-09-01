import { createSelector } from "reselect";
import { AppRootState } from "../../lib/types/screen";

const selectDashboardPage = (state: AppRootState) => state.menuPage;

export const retrieveProducts = createSelector(
  selectDashboardPage,
  (menuPage) => menuPage.products
);

