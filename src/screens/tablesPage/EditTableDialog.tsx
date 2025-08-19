import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { RTable, TableStatus } from "./types";

type Props = {
  open: boolean;
  table: RTable | null;
  onClose: () => void;
  onSave: (data: {
    _id: string;
    tableNumber: string;
    tableStatus: TableStatus;
  }) => void;
  existingNumbers?: string[]; // to prevent duplicate table numbers
};

export default function EditTableDialog({
  open,
  table,
  onClose,
  onSave,
  existingNumbers = [], // TODO: all tables
}: Props) {
  const [tableNumber, setTableNumber] = React.useState("");
  const [status, setStatus] = React.useState<TableStatus>("AVAILABLE");

  React.useEffect(() => {
    if (open && table) {
      setTableNumber(table.tableNumber);
      setStatus(table.tableStatus);
    }
  }, [open, table]);

  if (!table) return null;

  const trimmed = tableNumber.trim();
  const dupList = existingNumbers.filter((n) => n !== table.tableNumber);
  const isDup = trimmed && dupList.includes(trimmed);
  const canSave = !!trimmed && !isDup;

  const submit = () => {
    if (!canSave) return;
    onSave({ _id: table._id, tableNumber: trimmed, tableStatus: status });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={"700"}>Edit table #{table.tableNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            autoFocus
            // error={isDup}
            helperText={isDup ? "This table number already exists" : " "}
          />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
            >
              <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
              <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
              <MenuItem value="CLEANING">CLEANING</MenuItem>
            </Select>
            <FormHelperText>Current status</FormHelperText>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            QR token (read-only): <b>{table.qrToken}</b>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
