import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, Typography, Stack, Grid, Box } from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { retrieveTableStatus } from "./selector";
import { Table } from "../../lib/types/table";
import "../../css/tableStatus.css";

const tableStatusRetriever = createSelector(
  retrieveTableStatus,
  (tableStatus) => ({ tableStatus })
);

export default function TableStatusTop() {
  const { t } = useTranslation();
  const { tableStatus } = useSelector(tableStatusRetriever);

  return (
    <Card className="table-status-card table-status-top-card">
      <CardContent sx={{ width: "100%", padding: "12px 16px" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h5" className="table-status-top-title">
            {t("dashboard.ordersPanel")}
          </Typography>
        </Stack>

        <Grid container spacing={1} className="table-status-top-grid">
          {tableStatus?.map((table: Table) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={`top-${table._id}`}>
              <Box className="table-top-item">
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" className="table-top-number">
                    {table.tableNumber}
                  </Typography>
                  <TableRestaurantIcon fontSize="small" />
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
