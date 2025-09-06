import { createSlice } from "@reduxjs/toolkit";
import {  UsersPageState } from "../../lib/types/screen";

const initialState: UsersPageState = {
  users: [],
};

const usersPageSlice = createSlice({
  name: "usersPage",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = usersPageSlice.actions;

export default usersPageSlice.reducer;
