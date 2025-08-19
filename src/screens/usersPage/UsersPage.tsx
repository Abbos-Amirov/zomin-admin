import React from 'react';
import {
  Paper, Stack, TextField, Typography, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { RUser, UserStatus } from './types';
import { USERS_SEED } from './sampleData';
import UsersTable from './UsersTable';
import EditUserDialog from './EditUserDialog';

export default function MainPage() {
  const [rows, setRows] = React.useState<RUser[]>(USERS_SEED);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<UserStatus | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RUser | null>(null);
  const limit = 8;

  React.useEffect(() => { setPage(1); }, [search, status]);

  const viewRows = React.useMemo(() => {
    let r = [...rows];
    const s = search.trim().toLowerCase();
    if (s) {
      r = r.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.phone.toLowerCase().includes(s)
      );
    }
    if (status !== 'ALL') r = r.filter(u => u.status === status);
    r.sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return r;
  }, [rows, search, status]);

  const handleOpenEdit = (u: RUser) => { setEditing(u); setEditOpen(true); };
  const handleCloseEdit = () => { setEditOpen(false); setEditing(null); };

  const handleSaveEdit = ({ _id, name, phone, status }: { _id: string; name: string; phone: string; status: UserStatus }) => {
    setRows(prev => prev.map(u =>
      u._id === _id ? { ...u, name, phone, status, updatedAt: new Date().toISOString() } : u
    ));
    handleCloseEdit();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h3" fontWeight={700} textAlign={"center"}>Users</Typography>

      {/* Top controls: search + status filter */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            size="small"
            label="Search (name or phone)"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="block">block</MenuItem>
              <MenuItem value="delete">delete</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <UsersTable
        rows={viewRows}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
      />

      <EditUserDialog
        open={editOpen}
        user={editing}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </Stack>
  );
}
