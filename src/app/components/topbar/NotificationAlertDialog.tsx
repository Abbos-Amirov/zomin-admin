import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";

export default function NotificationAlertDialog() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { notificationAlert, setNotificationAlert } = useGlobals();

  const open = Boolean(notificationAlert);
  const isCall = notificationAlert?.type === "CALL";
  const isOrder = notificationAlert?.type === "ORDER";
  const lang = i18n.resolvedLanguage || i18n.language || "uz";

  const dict = useMemo(() => {
    if (lang === "ru") {
      return {
        typeCall: "Вызов официанта",
        typeOrder: "Новый заказ",
        table: "Стол",
        fromTable: "Со стола",
        gotIt: "Понятно",
        openDetails: "Подробнее",
      };
    }
    if (lang === "en") {
      return {
        typeCall: "Waiter Call",
        typeOrder: "New Order",
        table: "Table",
        fromTable: "From table",
        gotIt: "Got it",
        openDetails: "Open details",
      };
    }
    if (lang === "uz-Cyrl") {
      return {
        typeCall: "Официант чақируви",
        typeOrder: "Янги буюртма",
        table: "Стол",
        fromTable: "Қайси столдан",
        gotIt: "Тушундим",
        openDetails: "Батафсил",
      };
    }
    return {
      typeCall: "Ofitsiant chaqiruvi",
      typeOrder: "Yangi buyurtma",
      table: "Stol",
      fromTable: "Qaysi stoldan",
      gotIt: "Tushundim",
      openDetails: "Batafsil",
    };
  }, [lang]);

  const tableNumber = useMemo(() => {
    if (!notificationAlert) return null;
    if (notificationAlert.tableNumber) return notificationAlert.tableNumber;
    const sourceText = `${notificationAlert.message || ""} ${notificationAlert.title || ""}`;
    const m = sourceText.match(/(?:Table|Stol|Стол)\s*:?\s*(\d+)/i);
    return m ? m[1] : null;
  }, [notificationAlert]);

  const handleClose = () => setNotificationAlert(null);

  const handleGoToTable = () => {
    if (notificationAlert?.tableId) {
      navigate(`/tables/${notificationAlert.tableId}`, {
        state: notificationAlert.tableNumber ? { tableNumber: notificationAlert.tableNumber } : undefined,
      });
      setNotificationAlert(null);
    }
  };

  if (!notificationAlert) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0 }}>
        {isCall && (
          <Chip
            icon={<PhoneInTalkIcon sx={{ fontSize: 18 }} />}
            label={dict.typeCall}
            color="primary"
            size="small"
          />
        )}
        {isOrder && (
          <Chip
            icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
            label={dict.typeOrder}
            color="success"
            size="small"
          />
        )}
        {!isCall && !isOrder && (
          <Chip
            icon={<TableRestaurantIcon sx={{ fontSize: 18 }} />}
            label={t("notificationAlert.newNotification") || "Bildirishnoma"}
            size="small"
          />
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        {notificationAlert.tableId && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "text.secondary" }}>
            <TableRestaurantIcon fontSize="small" />
            <Typography variant="body2">
              {dict.fromTable}: {dict.table} {tableNumber || notificationAlert.tableId}
            </Typography>
          </Box>
        )}
        <Typography variant="body1" color="text.primary">
          {notificationAlert.message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {dict.gotIt}
        </Button>
        {notificationAlert.tableId && (
          <Button onClick={handleGoToTable} variant="contained">
            {dict.openDetails}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
