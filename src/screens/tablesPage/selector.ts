import { createSelector } from "reselect";
import { AppRootState } from "../../lib/types/screen";

const selectTablesPage = (state: AppRootState) => state.tablesPage;

export const retrieveTables = createSelector(
  selectTablesPage,
  (tablesPage) => tablesPage.tables
);

