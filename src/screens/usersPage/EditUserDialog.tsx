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
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="NickName"
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
            label="Phone number"
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
              label="MemberStatus"
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
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onUpdateHandler(edit)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
