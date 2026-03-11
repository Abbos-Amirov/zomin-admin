import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setTableStatus } from "../dashboardPage/slice";
import { TableInquiry } from "../../lib/types/table";
import TableService from "../../services/Table.service";
import TableInfo from "../dashboardPage/TableStatus";
import TableStatusTop from "../dashboardPage/TableStatusTop";
import { Box, Stack } from "@mui/material";

const actionDispatch = (dispatch: Dispatch) => ({
  setTableStatus: (data: any[]) => dispatch(setTableStatus(data)),
});

export default function OrderStatusPage() {
  const { setTableStatus } = actionDispatch(useDispatch());
  const [inquiry, setInquiry] = useState<TableInquiry>({
    limit: 1000,
    page: 1,
  });

  useEffect(() => {
    const table = new TableService();
    table
      .getAllTables(inquiry)
      .then((data) => setTableStatus(data))
      .catch((err) => console.warn("getAllTables:", err));
  }, [inquiry, setTableStatus]);

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Stack spacing={3}>
        <TableStatusTop />
        <TableInfo inquiry={inquiry} setInquiry={setInquiry} />
      </Stack>
    </Box>
  );
}
