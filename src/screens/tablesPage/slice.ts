import { createSlice } from "@reduxjs/toolkit";
import { TablesPageState } from "../../lib/types/screen";

const initialState: TablesPageState = {
  tables: [],
};

const tablesPageSlice = createSlice({
  name: "tablesPage",
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
    },
  },
});

export const { setTables } = tablesPageSlice.actions;

export default tablesPageSlice.reducer;
