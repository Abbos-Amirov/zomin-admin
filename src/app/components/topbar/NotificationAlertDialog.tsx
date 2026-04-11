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
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { useNavigate } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import { useDispatch, useSelector } from "react-redux";
import TableService from "../../../services/Table.service";
import { TableCall } from "../../../lib/enums/tableCall.enum";
import { setTableStatus } from "../../../screens/dashboardPage/slice";
import { retrieveTableStatus } from "../../../screens/dashboardPage/selector";
import { Table } from "../../../lib/types/table";
import { alpha } from "@mui/material/styles";

export default function NotificationAlertDialog() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { notificationAlert, setNotificationAlert, setNotifications } = useGlobals();
  const dispatch = useDispatch();
  const tableStatus = useSelector(retrieveTableStatus);

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

  const clearSpecificTableCall = async () => {
    if (!notificationAlert?.tableId || !isCall) return;
    if (Array.isArray(tableStatus) && tableStatus.length > 0) {
      const updated = (tableStatus as Table[]).map((t) =>
        t._id === notificationAlert.tableId ? { ...t, tableCall: TableCall.PAUSE } : t
      );
      dispatch(setTableStatus(updated));
    }
    try {
      const tableSvc = new TableService();
      await tableSvc.updateChosenTable({
        _id: notificationAlert.tableId,
        tableCall: TableCall.PAUSE,
      });
    } catch {
      // UI allaqachon yangilangan
    }
  };

  const handleClose = () => {
    clearSpecificTableCall().then();
    setNotificationAlert(null);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleGoToDetails = () => {
    const n = notificationAlert;
    if (!n) return;
    const resolvedTableNum = n.tableNumber || tableNumber;
    if (isOrder) {
      if (n.orderId) {
        navigate(`/orders/${n.orderId}`);
      } else if (resolvedTableNum) {
        navigate(`/orders-panel/table/${encodeURIComponent(resolvedTableNum)}`);
      } else if (n.tableId) {
        navigate(`/tables/${n.tableId}`, {
          state: resolvedTableNum ? { tableNumber: resolvedTableNum } : undefined,
        });
      }
    } else if (n.tableId) {
      navigate(`/tables/${n.tableId}`, {
        state: resolvedTableNum ? { tableNumber: resolvedTableNum } : undefined,
      });
    }
    setNotificationAlert(null);
  };

  if (!notificationAlert) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "min(92vh, 520px)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: { xs: "calc(100% - 24px)", sm: 440 },
          mx: { xs: 1.5, sm: "auto" },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(165deg, rgba(28,32,40,0.98) 0%, rgba(16,18,24,1) 55%, rgba(12,14,18,1) 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f4f6fb 48%, #eef1f8 100%)",
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset"
              : "0 24px 48px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(255,255,255,0.8) inset",
        },
      }}
    >
      <DialogTitle
        sx={{
          flexShrink: 0,
          pt: 2.5,
          pb: 2,
          px: 2.5,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, transparent 65%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light}33 0%, transparent 60%)`,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {isCall && (
            <Chip
              icon={<PhoneInTalkIcon sx={{ fontSize: 22 }} />}
              label={dict.typeCall}
              color="primary"
              size="medium"
              sx={{
                fontSize: 15,
                fontWeight: 700,
                height: 36,
                "& .MuiChip-icon": { color: "inherit" },
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "0 4px 14px rgba(33,150,243,0.35)" : "0 4px 12px rgba(25, 118, 210, 0.25)",
              }}
            />
          )}
          {isOrder && (
            <Chip
              icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
              label={dict.typeOrder}
              color="success"
              size="medium"
              sx={{
                fontSize: 15,
                fontWeight: 700,
                height: 36,
                "& .MuiChip-icon": { color: "inherit" },
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "0 4px 14px rgba(46,125,50,0.4)" : "0 4px 12px rgba(46, 125, 50, 0.28)",
              }}
            />
          )}
          {!isCall && !isOrder && (
            <Chip
              icon={<TableRestaurantIcon sx={{ fontSize: 18 }} />}
              label={t("notificationAlert.newNotification") || "Bildirishnoma"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
          px: 2.5,
          pt: 2,
          pb: 1.5,
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 4,
            bgcolor: "action.disabledBackground",
          },
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            p: 2,
            mb: 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "none" : "0 2px 8px rgba(15,23,42,0.06)",
          }}
        >
          {(notificationAlert.tableId || tableNumber) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
                color: isCall ? "primary.main" : isOrder ? "success.main" : "info.main",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) =>
                    alpha(
                      isCall
                        ? theme.palette.primary.main
                        : isOrder
                          ? theme.palette.success.main
                          : theme.palette.info.main,
                      theme.palette.mode === "dark" ? 0.22 : 0.14
                    ),
                }}
              >
                <TableRestaurantIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.35 }}>
                {dict.fromTable}: {dict.table} {tableNumber || notificationAlert.tableId}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              fontSize: "1.02rem",
              lineHeight: 1.65,
              wordBreak: "break-word",
            }}
          >
            {notificationAlert.message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          flexShrink: 0,
          px: 2.5,
          pt: 1,
          pb: 2,
          gap: 1,
          flexWrap: "wrap",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(248,250,252,0.95)",
        }}
      >
        <Button onClick={handleClose} variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}>
          {dict.gotIt}
        </Button>
        {(notificationAlert.tableId || notificationAlert.orderId || tableNumber) && (
          <Button onClick={handleGoToDetails} variant="contained" sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}>
            {dict.openDetails}
          </Button>
        )}
      </DialogActions>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.75,
          borderTop: "2px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(15, 23, 42, 0.08)",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(20,24,32,0.95) 0%, rgba(12,14,20,1) 100%)"
              : "linear-gradient(180deg, #f0f4ff 0%, #e8ecf8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          fullWidth
          variant="text"
          size="medium"
          onClick={handleMarkAllNotificationsRead}
          startIcon={<DoneAllRoundedIcon sx={{ fontSize: 22 }} />}
          sx={{
            py: 1,
            borderRadius: 2,
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: 0.03,
            color: "primary.main",
            textTransform: "none",
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(33,150,243,0.12)" : "rgba(25, 118, 210, 0.1)",
            },
          }}
        >
          {t("topbar.markAllRead")}
        </Button>
      </Box>
    </Dialog>
  );
}
