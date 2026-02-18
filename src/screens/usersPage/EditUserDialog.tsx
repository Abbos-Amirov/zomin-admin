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
import { MemberUpdateInput, UserInquiry } from "../../lib/types/member";
import { Messages } from "../../lib/config";
import MemberService from "../../services/Member.service";
import {
  sweetCenterSuccessAlert,
  sweetErrorHandling,
} from "../../lib/sweetAlert";
import { MemberStatus } from "../../lib/enums/member.enum";

interface EditUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  edit: MemberUpdateInput;
  setEdit: (edit: MemberUpdateInput) => void;
  userSearch: UserInquiry;
  setUserSearch: (input: UserInquiry) => void;
}

export default function EditUserDialog(props: EditUserDialogProps) {
  const { t } = useTranslation();
  const { open, setOpen, edit, setEdit, userSearch, setUserSearch } = props;

  /** HANDLERS **/
  const onUpdateHandler = async (input: MemberUpdateInput) => {
    try {
      if (edit.memberNick === "" || edit.memberPhone === "")
        throw Error(Messages.error3);
      const member = new MemberService();
      await member.updateChosenUser(input);
      setUserSearch({ ...userSearch });
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
      <DialogTitle>{t("users.editUser")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("users.nickname")}
            value={edit.memberNick}
            onChange={(e) =>
              setEdit({
                ...edit,
                memberNick: e.target.value as string,
              })
            }
            autoFocus
          />
          <TextField
            label={t("users.phoneNumber")}
            value={edit.memberPhone}
            onChange={(e) =>
              setEdit({
                ...edit,
                memberPhone: e.target.value as string,
              })
            }
          />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label={t("users.memberStatus")}
              value={edit.memberStatus}
              onChange={(e) =>
                setEdit({
                  ...edit,
                  memberStatus: e.target.value as MemberStatus,
                })
              }
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="BLOCK">BLOCK</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpen(false)}
        >
          {t("users.cancel")}
        </Button>
        <Button variant="contained" onClick={() => onUpdateHandler(edit)}>
          {t("users.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
