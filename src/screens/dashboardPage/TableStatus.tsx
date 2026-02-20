// TableStatus.tsx
import React from "react";
import { useTranslation } from "react-i18next";
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
import "../../css/tableStatus.css";

/** REDUX SLICE & SELECTOR */
const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

const getTableStatusClass = (s: TableStatus): string => {
  switch (s) {
    case TableStatus.OCCUPIED:
      return "occupied";
    case TableStatus.CLEANING:
      return "cleaning";
    case TableStatus.AVAILABLE:
      return "available";
    default:
      return "available";
  }
};

interface TableInfoProps {
  inquiry: TableInquiry;
  setInquiry: (input: TableInquiry) => void;
}

export default function TableInfo(props: TableInfoProps) {
  const { t } = useTranslation();
  const { tableStatus } = useSelector(tableStatusRetriever);

  const { setInquiry, inquiry } = props;

  /** HANDLERS **/
  const callButtonHandler = async (input: TableUpdateInput) => {
    try {
      const table = new TableService();
      const confirmation = window.confirm(t("dashboard.markAsReadConfirm"));
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
    <Card className="table-status-card">
      <CardContent sx={{ width: '100%', padding: '16px' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="table-status-header"
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            className="table-status-title-section"
          >
            <Avatar variant="rounded" className="table-status-avatar">
              <TableRestaurantIcon />
            </Avatar>
            <Typography variant="h3" className="table-status-title">
              {t("dashboard.tableStatus")}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} className="table-status-legend">
            <Stack direction="row" spacing={1} alignItems="center" className="table-status-legend-item">
              <Box className="table-status-legend-dot occupied" />
              <Typography variant="h5">{t("dashboard.occupied")}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" className="table-status-legend-item">
              <Box className="table-status-legend-dot cleaning" />
              <Typography variant="h5">{t("dashboard.cleaning")}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" className="table-status-legend-item">
              <Box className="table-status-legend-dot free" />
              <Typography variant="h5">{t("dashboard.free")}</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider className="table-status-divider" />

        <Grid container spacing={1.5} className="table-status-grid" sx={{ width: '100%', margin: 0 }}>
          {tableStatus.map((table) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={table._id} sx={{ display: 'flex', minWidth: 0 }}>
              <Box
                className={`table-card ${getTableStatusClass(table.tableStatus)}`}
                sx={{ width: '100%', minWidth: 0 }}
              >
                <Stack
                  height={"100%"}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  className="table-card-content"
                >
                  <Stack className="table-card-left">
                    <Typography variant="h3" className="table-number">
                      {table.tableNumber}
                    </Typography>
                    <Typography variant="body2" className="table-status-label">
                      {table.tableStatus === TableStatus.AVAILABLE
                        ? t("tables.available")
                        : table.tableStatus === TableStatus.OCCUPIED
                        ? t("tables.occupied")
                        : t("tables.cleaning")}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" className="table-card-right">
                    {table.tableCall === TableCall.ACTIVE && (
                      <Button
                        onClick={() =>
                          callButtonHandler({
                            _id: table._id,
                            tableCall: TableCall.PAUSE,
                          })
                        }
                        className="table-notification-button"
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
                    <Avatar className="table-icon-avatar">
                      {table.tableStatus === TableStatus.CLEANING ? (
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
