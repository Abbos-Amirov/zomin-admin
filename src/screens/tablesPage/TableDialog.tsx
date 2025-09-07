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
} from "@mui/material";
import {
  TableInput,
  TableInquiry,
  TableUpdateInput,
} from "../../lib/types/table";
import { Messages } from "../../lib/config";
import TableService from "../../services/Table.service";
import {
  sweetCenterSuccessAlert,
  sweetErrorHandling,
} from "../../lib/sweetAlert";
import { TableStatus } from "../../lib/enums/table.enum";

interface TableDialogProps {
  open: boolean;
  create: boolean;
  setOpen: (open: boolean) => void;
  edit: TableUpdateInput;
  setEdit: (edit: TableUpdateInput) => void;
  tableSearch: TableInquiry;
  setTableSearch: (input: TableInquiry) => void;
}

export default function TableDialog(props: TableDialogProps) {
  const { open, create, setOpen, edit, setEdit, tableSearch, setTableSearch } =
    props;

  /** HANDLERS **/
  const onCreateHandler = async (input: TableInput) => {
    try {
      if (input.tableNumber === "" || input.tableStatus === null)
        throw Error(Messages.error3);
      const table = new TableService();
      await table.createNewTable(input);
      setTableSearch({ ...tableSearch });
      setOpen(false);
      sweetCenterSuccessAlert("Created!", 700);
    } catch (err) {
      console.log(err);
      setOpen(false);
      sweetErrorHandling(err).then();
    }
  };

  const onUpdateHandler = async (input: TableUpdateInput) => {
    try {
      if (input.tableNumber === "" || input.tableStatus === null)
        throw Error(Messages.error3);
      const table = new TableService();
      await table.updateChosenTable(input);
      setTableSearch({ ...tableSearch });
      setOpen(false);
      sweetCenterSuccessAlert("Updated!", 700);
    } catch (err) {
      console.log(err);
      setOpen(false);
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={"700"}>
        {create ? "Add new table" : `Edit table #${edit.tableNumber}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Table number"
            value={edit.tableNumber}
            onChange={(e) => {
              setEdit({
                ...edit,
                tableNumber: e.target.value as string,
              });
            }}
            autoFocus
          />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={edit.tableStatus}
              onChange={(e) => {
                setEdit({
                  ...edit,
                  tableStatus: e.target.value as TableStatus,
                });
              }}
            >
              <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
              <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
              <MenuItem value="CLEANING">CLEANING</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={(e) => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={(e) => {
            if (create) {
              onCreateHandler({
                tableNumber: edit.tableNumber as string,
                tableStatus: edit.tableStatus as TableStatus,
              });
            } else {
              onUpdateHandler({
                _id: edit._id as string,
                tableNumber: edit.tableNumber as string,
                tableStatus: edit.tableStatus as TableStatus,
              });
            }
          }}
        >
          {create ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
