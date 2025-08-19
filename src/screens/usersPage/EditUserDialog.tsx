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
import type { RUser, UserStatus } from "./types";

type Props = {
  open: boolean;
  user: RUser | null;
  onClose: () => void;
  onSave: (data: {
    _id: string;
    name: string;
    phone: string;
    status: UserStatus;
  }) => void;
};

export default function EditUserDialog({ open, user, onClose, onSave }: Props) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus>("active");

  React.useEffect(() => {
    if (open && user) {
      setName(user.name);
      setPhone(user.phone);
      setStatus(user.status);
    }
  }, [open, user]);

  if (!user) return null;

  const canSave = name.trim().length > 0 && phone.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="block">block</MenuItem>
              <MenuItem value="delete">delete</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            onSave({
              _id: user._id,
              name: name.trim(),
              phone: phone.trim(),
              status,
            })
          }
          disabled={!canSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
