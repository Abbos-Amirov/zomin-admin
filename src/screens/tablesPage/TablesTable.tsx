// src/features/tables/TablesTable.tsx
import React from "react";
import {
  Button,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditTableDialog from "./EditTableDialog";
import { QRCodeSVG } from "qrcode.react";
import type { RTable, TableStatus } from "./types";

const statusColor = (s: TableStatus) =>
  s === "AVAILABLE" ? "success" : s === "OCCUPIED" ? "error" : "warning";

const fmt = (d: string) => new Date(d).toLocaleString();

// --- helpers: SVG → PNG ---
function downloadSvgAsPng(svgEl: SVGSVGElement, filename: string, px = 1024) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns"))
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d")!;
    (ctx as any).imageSmoothingEnabled = false; // keep modules crisp
    ctx.drawImage(img, 0, 0, px, px);
    URL.revokeObjectURL(svgUrl);

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  img.src = svgUrl;
}

type Props = {
  rows: RTable[];
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onQuickSet: (id: string, status: TableStatus) => void; // Action <Select>
  onSaveEdit: (data: {
    _id: string;
    tableNumber: string;
    tableStatus: TableStatus;
  }) => void;
  onDelete: (t: RTable) => void;
  onEdit?: (t: RTable) => void; // optional (legacy)
  isAdmin?: boolean; // disable actions when false
};

export default function TablesTable({
  rows,
  page,
  limit,
  onPageChange,
  onQuickSet,
  onSaveEdit,
  onDelete,
  onEdit, // optional legacy
  isAdmin = true,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const start = (page - 1) * limit;
  const paged = rows.slice(start, start + limit);

  // local state for the edit dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RTable | null>(null);

  const openEdit = (t: RTable) => {
    setEditing(t);
    setEditOpen(true);
    onEdit?.(t);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };
  const handleSave = (data: {
    _id: string;
    tableNumber: string;
    tableStatus: TableStatus;
  }) => {
    onSaveEdit(data);
    closeEdit();
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Table</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Current Order</TableCell>
            <TableCell>QR</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paged.map((t) => {
            const url = `http://localhost:3000/scan?t=${encodeURIComponent(
              t.qrToken
            )}`;
            const qrId = `qr-${t._id}`;
            return (
              <TableRow key={t._id} hover>
                <TableCell>#{t.tableNumber}</TableCell>

                {/* read-only status chip */}
                <TableCell>
                  <Chip
                    size="small"
                    label={t.tableStatus}
                    color={statusColor(t.tableStatus) as any}
                  />
                </TableCell>

                <TableCell sx={{ fontFamily: "monospace" }}>
                  {t.currentOrderId ? t.currentOrderId.slice(-6) : "-"}
                </TableCell>

                {/* QR preview + Download buttons */}
                <TableCell>
                  <Tooltip title={url}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <QRCodeSVG id={qrId} value={url} size={96} level="L" />
                      <Stack direction="column" spacing={0.5}>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            const svg = document.getElementById(
                              qrId
                            ) as SVGSVGElement | null;
                            if (svg)
                              downloadSvgAsPng(
                                svg,
                                `table-${t.tableNumber}-qr.png`,
                                1024
                              );
                          }}
                        >
                          PNG
                        </Button>
                      </Stack>
                    </div>
                  </Tooltip>
                </TableCell>

                <TableCell>{fmt(t.createdAt)}</TableCell>
                <TableCell>{fmt(t.updateAt)}</TableCell>

                {/* Action: select + edit/delete */}
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    alignItems="center"
                  >
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select<TableStatus>
                        value={t.tableStatus}
                        onChange={(e) =>
                          onQuickSet(t._id, e.target.value as TableStatus)
                        }
                        disabled={!isAdmin}
                      >
                        <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                        <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
                        <MenuItem value="CLEANING">CLEANING</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      size="small"
                      color="secondary"
                      variant="contained"
                      onClick={() => openEdit(t)}
                      disabled={!isAdmin}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => onDelete(t)}
                      disabled={!isAdmin}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}

          {paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No tables</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Divider />
      <Stack direction="row" justifyContent="center" p={5}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, p) => onPageChange(p)}
          size="medium"
          color="secondary"
        />
      </Stack>

      {/* integrated edit dialog */}
      <EditTableDialog
        open={editOpen}
        table={editing}
        onClose={closeEdit}
        onSave={handleSave}
        existingNumbers={rows.map((r) => r.tableNumber)}
      />
    </TableContainer>
  );
}
