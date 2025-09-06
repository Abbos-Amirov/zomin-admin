import { createSelector } from "reselect";
import { AppRootState } from "../../lib/types/screen";

const selectUsersPage = (state: AppRootState) => state.usersPage;

export const retrieveUsers = createSelector(
  selectUsersPage,
  (usersPage) => usersPage.users
);

