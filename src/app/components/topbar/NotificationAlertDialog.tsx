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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notificationAlert, setNotificationAlert } = useGlobals();

  const open = Boolean(notificationAlert);
  const isCall = notificationAlert?.type === "CALL";
  const isOrder = notificationAlert?.type === "ORDER";

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
            label={t("notificationAlert.typeCall") || "Qo'ng'iroq"}
            color="primary"
            size="small"
          />
        )}
        {isOrder && (
          <Chip
            icon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
            label={t("notificationAlert.typeOrder") || "Buyurtma"}
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
              {t("tableStatus.table") || "Stol"} {notificationAlert.tableNumber || notificationAlert.tableId}
            </Typography>
          </Box>
        )}
        <Typography variant="body1" color="text.primary">
          {notificationAlert.message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {t("notificationAlert.gotIt") || "Tushundim"}
        </Button>
        {notificationAlert.tableId && (
          <Button onClick={handleGoToTable} variant="contained">
            {t("tableStatus.openDetails") || "Stolga o'tish"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
