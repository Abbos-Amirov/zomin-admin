import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { RUser, UserStatus } from "./types";

const statusColor = (s: UserStatus) =>
  s === "active" ? "success" : s === "block" ? "warning" : "error";

const fmt = (d: string) => new Date(d).toLocaleString();

type Props = {
  rows: RUser[];
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onEdit: (u: RUser) => void;
};

export default function UsersTable({
  rows,
  page,
  limit,
  onPageChange,
  onEdit,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const start = (page - 1) * limit;
  const paged = rows.slice(start, start + limit);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>NickName</TableCell>
            <TableCell>PhoneNumber</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((u, index) => (
            <TableRow key={u._id} hover>
              <TableCell>#{index + 1}</TableCell>

              <TableCell>
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    src={u.avatarUrl}
                    alt={u.name}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box marginLeft={"8px"}>{u.name}</Box>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace" }}>{u.phone}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={u.status}
                  color={statusColor(u.status) as any}
                />
              </TableCell>
              <TableCell>{fmt(u.createdAt)}</TableCell>
              <TableCell>{fmt(u.updatedAt)}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onEdit(u)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No users</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Divider />
      <Stack direction="row" justifyContent="center" p={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, p) => onPageChange(p)}
          size="medium"
          color="secondary"
        />
      </Stack>
    </TableContainer>
  );
}
