import React from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { RTable, TableStatus } from "./types";
import { TABLES_SEED } from "./sampleData";
import TablesTable from "./TablesTable";
import AddTableDialog from "./AddTableDialog";

export default function TablesPage() {
  const [rows, setRows] = React.useState<RTable[]>(TABLES_SEED);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<TableStatus | "ALL">("ALL");
  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);
  const limit = 8;

  React.useEffect(() => {
    setPage(1);
  }, [search, status]);

  const viewRows = React.useMemo(() => {
    let r = [...rows];
    const s = search.trim().toLowerCase();
    if (s) {
      r = r.filter(
        (t) =>
          t.tableNumber.toLowerCase().includes(s) ||
          (t.currentOrderId || "").toLowerCase().includes(s) ||
          t.qrToken.toLowerCase().includes(s)
      );
    }
    if (status !== "ALL") r = r.filter((t) => t.tableStatus === status);
    r.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return r;
  }, [rows, search, status]);

  const onQuickSet = (id: string, st: TableStatus) => {
    setRows((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, tableStatus: st, updateAt: new Date().toISOString() }
          : t
      )
    );
  };

  // --- Add table handlers ---
  const makeId = () =>
    (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) +
    Date.now().toString(36);
  const genQrToken = (tableNumber: string) =>
    `tbl-${tableNumber}-${Math.random().toString(36).slice(2, 8)}`;

  const handleCreateTable = ({
    tableNumber,
    tableStatus,
  }: {
    tableNumber: string;
    tableStatus: TableStatus;
  }) => {
    const now = new Date().toISOString();
    const newRow: RTable = {
      _id: makeId(),
      tableNumber,
      qrToken: genQrToken(tableNumber), // backend will mint later; mocked here
      tableStatus,
      currentOrderId: null,
      createdAt: now,
      updateAt: now,
    };
    setRows((prev) => [newRow, ...prev]);
    setAddOpen(false);
    setPage(1);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Typography variant="h3" fontWeight={700} margin={"10px"}>
          Tables
        </Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent={"space-between"}
        >
          <Box>
            <TextField
              size="small"
              label="Search (table/order/token)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260, marginRight: "10px" }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
                <MenuItem value="CLEANING">CLEANING</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add table
            </Button>
          </Box>
        </Stack>
      </Paper>

      <TablesTable
        rows={viewRows}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onQuickSet={onQuickSet}
        onSaveEdit={({ _id, tableNumber, tableStatus }) => {
          setRows((prev) =>
            prev.map((t) =>
              t._id === _id
                ? {
                    ...t,
                    tableNumber,
                    tableStatus,
                    updateAt: new Date().toISOString(),
                  }
                : t
            )
          );
        }}
        onDelete={(t) => {
          if (window.confirm(`Delete table #${t.tableNumber}?`)) {
            setRows((prev) => prev.filter((x) => x._id !== t._id));
          }
        }}
      />

      <AddTableDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreateTable}
        existingNumbers={rows.map((r) => r.tableNumber)}
      />
    </Stack>
  );
}
