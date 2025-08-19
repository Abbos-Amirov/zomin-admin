import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  FormHelperText,
} from "@mui/material";
import type { TableStatus } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { tableNumber: string; tableStatus: TableStatus }) => void;
  existingNumbers?: string[];
};

export default function AddTableDialog({
  open,
  onClose,
  onCreate,
  existingNumbers = [],
}: Props) {
  const [tableNumber, setTableNumber] = React.useState("");
  const [status, setStatus] = React.useState<TableStatus>("AVAILABLE");

  const trimmed = tableNumber.trim();
  const duplicate = trimmed && existingNumbers.includes(trimmed);
  const canSave = !!trimmed && !duplicate;

  const submit = () => {
    if (!canSave) return;
    onCreate({ tableNumber: trimmed, tableStatus: status });
  };

  React.useEffect(() => {
    if (!open) {
      setTableNumber("");
      setStatus("AVAILABLE");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={"700"}>Add table</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Table number"
            placeholder="e.g. 12"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            autoFocus
            helperText={duplicate ? "This table number already exists" : " "}
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
            <FormHelperText>Initial status</FormHelperText>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canSave}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
