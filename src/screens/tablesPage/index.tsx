import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import TablesTable from "./TablesTable";
import TableFilter from "./TableFilter";
import { Dispatch } from "@reduxjs/toolkit";
import { setTables } from "./slice";
import {
  Table,
  TableInput,
  TableInquiry,
  TableUpdateInput,
} from "../../lib/types/table";
import { useDispatch } from "react-redux";
import TableService from "../../services/Table.service";
import { sweetErrorHandling } from "../../lib/sweetAlert";
import EditTableDialog from "./TableDialog";
import TableDialog from "./TableDialog";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setTables: (data: Table[]) => dispatch(setTables(data)),
});

export default function TablesPage() {
  const { setTables } = actionDispatch(useDispatch());

  const [open, setOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<TableUpdateInput>({ _id: "" });
  const [create, setCreate] = useState<boolean>(false);
  const [tableSearch, setTableSearch] = useState<TableInquiry>({
    page: 1,
    limit: 6,
    search: "",
  });
  useEffect(() => {
    const table = new TableService();
    table
      .getAllTables(tableSearch)
      .then((data) => setTables(data))
      .catch((err) => {
        console.log(err);
        sweetErrorHandling(err).then();
      });
  }, [tableSearch]);

  return (
    <Stack spacing={2}>
      <TableFilter
        tableSearch={tableSearch}
        setTableSearch={setTableSearch}
        edit={edit}
        setEdit={setEdit}
        setCreate={setCreate}
        open={open}
        setOpen={setOpen}
      />

      <TablesTable
        tableSearch={tableSearch}
        setTableSearch={setTableSearch}
        setOpen={setOpen}
        setCreate={setCreate}
        edit={edit}
        setEdit={setEdit}
      />

      <TableDialog
        open={open}
        create={create}
        setOpen={setOpen}
        edit={edit}
        setEdit={setEdit}
        tableSearch={tableSearch}
        setTableSearch={setTableSearch}
      />
    </Stack>
  );
}
