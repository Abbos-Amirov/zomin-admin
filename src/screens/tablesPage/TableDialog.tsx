import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        {create ? t("tables.addNewTable") : `${t("tables.editTable")} #${edit.tableNumber}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("tables.tableNumber")}
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
            <InputLabel>{t("orders.status")}</InputLabel>
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
              <MenuItem value="AVAILABLE">{t("tables.available")}</MenuItem>
              <MenuItem value="OCCUPIED">{t("tables.occupied")}</MenuItem>
              <MenuItem value="CLEANING">{t("tables.cleaning")}</MenuItem>
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
          {t("tables.cancel")}
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
          {create ? t("tables.create") : t("tables.update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
