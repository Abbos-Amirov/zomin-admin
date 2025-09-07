import React, { useEffect, useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { TableInquiry, TableUpdateInput } from "../../lib/types/table";
import { TableStatus } from "../../lib/enums/table.enum";

interface TableFilterProps {
  tableSearch: TableInquiry;
  setTableSearch: (input: TableInquiry) => void;
  edit: TableUpdateInput;
  setEdit: (edit: TableUpdateInput) => void;
  setCreate: (input: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function TableFilter(props: TableFilterProps) {
  const {
    tableSearch,
    setTableSearch,
    edit,
    setEdit,
    setCreate,
    open,
    setOpen,
  } = props;

  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (searchText === "") {
      tableSearch.search = "";
      setTableSearch({ ...tableSearch });
    }
  }, [searchText]);

  /** HANDLERS **/
  const searchTableHandler = () => {
    tableSearch.search = searchText;
    setTableSearch({ ...tableSearch });
  };

  const searchTableStatusHandler = (status: TableStatus) => {
    tableSearch.page = 1;
    tableSearch.status = status;
    setTableSearch({ ...tableSearch });
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Typography variant="h3" fontWeight={700} margin={"10px"}>
          Tables
        </Typography>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent={"space-between"}
        >
          <Stack direction={"row"} gap={"10px"}>
            <Box>
              <input
                type="search"
                name="singleResearch"
                placeholder="Type here"
                className="search-input"
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchTableHandler();
                }}
              />
              <Button
                variant="contained"
                color="primary"
                className="search-input-btn"
                endIcon={<SearchIcon />}
                onClick={searchTableHandler}
              >
                Search
              </Button>
            </Box>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={edit.tableStatus}
                onChange={(e) =>
                  searchTableStatusHandler(e.target.value as TableStatus)
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>
                <MenuItem value="CLEANING">CLEANING</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCreate(true);
                setOpen(true);
                setEdit({
                  ...edit,
                  tableNumber: "",
                  tableStatus: TableStatus.CLEANING,
                });
              }}
            >
              Add table
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
