// TableStatus.tsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Grid,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CleaningServicesRoundedIcon from "@mui/icons-material/CleaningServicesRounded";
import { RippleBadge } from "../../app/MaterialTheme/styled";
import { retrieveTableStatus } from "./selector";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { TableStatus } from "../../lib/enums/table.enum";
import { TableCall } from "../../lib/enums/tableCall.enum";
import { TableInquiry, TableUpdateInput } from "../../lib/types/table";
import { sweetErrorHandling } from "../../lib/sweetAlert";
import TableService from "../../services/Table.service";

/** REDUX SLICE & SELECTOR */
const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

const bgByState = (s: TableStatus) =>
  s === "OCCUPIED"
    ? "warning.light"
    : s === "CLEANING"
    ? "info.light"
    : "background.default";

interface TableInfoProps {
  inquiry: TableInquiry;
  setInquiry: (input: TableInquiry) => void;
}

export default function TableInfo(props: TableInfoProps) {
  const { tableStatus } = useSelector(tableStatusRetriever);

  const { setInquiry, inquiry } = props;

  /** HANDLERS **/
  const callButtonHandler = async (input: TableUpdateInput) => {
    try {
      const table = new TableService();
      const confirmation = window.confirm("Do you want to Mark as Read?");
      if (confirmation) {
        await table.updateChosenTable(input);
        setInquiry({ ...inquiry });
      }
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Card sx={{ borderRadius: 3, maxHeight: "100%", marginBottom: "30px" }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: "#ede7f6",
                color: "#5e35b1",
                width: 36,
                height: 36,
              }}
            >
              <TableRestaurantIcon />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Table Status
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} color="text.primary">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "warning.light",
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Occupied</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "info.light",
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Cleaning</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: "background.default",
                  border: (t) => `3px solid ${t.palette.divider}`,
                  borderRadius: 1,
                }}
              />
              <Typography variant="h5">Free</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={1.5}>
          {tableStatus.map((t) => (
            <Grid item xs={4} sm={3} md={2.4 as any} lg={2} key={t._id}>
              <Box
                sx={{
                  height: "150px",
                  p: 1.5,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: bgByState(t.tableStatus),
                }}
              >
                <Stack
                  height={"100%"}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack>
                    <Typography variant="h3" fontWeight={700}>
                      {t.tableNumber}
                    </Typography>
                    <Typography variant="h4" color="text.primary">
                      {t.tableStatus}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {t.tableCall === TableCall.ACTIVE && (
                      <Button
                        onClick={() =>
                          callButtonHandler({
                            _id: t._id,
                            tableCall: TableCall.PAUSE,
                          })
                        }
                      >
                        <RippleBadge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          variant="dot"
                          color="error"
                        >
                          <NotificationsRoundedIcon fontSize="large" />
                        </RippleBadge>
                      </Button>
                    )}
                    <Avatar sx={{ width: 50, height: 50 }}>
                      {t.tableStatus === "CLEANING" ? (
                        <CleaningServicesRoundedIcon fontSize="large" />
                      ) : (
                        <TableRestaurantIcon fontSize="large" />
                      )}
                    </Avatar>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
