import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Tooltip,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { alpha } from "@mui/material/styles";
import { useGlobals } from "../../hooks/useGlobals";

const PANEL_WIDTH = 380;

export default function NotificationsMenu() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, setNotifications } = useGlobals();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 920;
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch {
        // autoplay policy
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={t("topbar.notifications")}>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: { xs: "calc(100vw - 24px)", sm: PANEL_WIDTH },
              maxWidth: PANEL_WIDTH,
              mt: 1,
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "min(480px, calc(100vh - 80px))",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(165deg, rgba(28,32,40,0.98) 0%, rgba(16,18,24,1) 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #f4f6fb 55%, #eef1f8 100%)",
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.1)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset"
                  : "0 20px 44px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(255,255,255,0.85) inset",
            },
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            px: 2.25,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(33,150,243,0.12) 0%, transparent 70%)"
                : "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, transparent 65%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
              }}
            >
              <NotificationsIcon sx={{ color: "primary.main", fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} letterSpacing={0.2} noWrap>
                {t("topbar.notifications")}
              </Typography>
              {notifications.length > 0 && unreadCount > 0 ? (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {t("topbar.notificationsUnreadBadge", { count: unreadCount })}
                </Typography>
              ) : null}
            </Box>
          </Box>
          {unreadCount > 0 ? (
            <Box
              component="span"
              sx={{
                minWidth: 26,
                height: 26,
                borderRadius: "50%",
                bgcolor: "error.main",
                color: "error.contrastText",
                fontSize: "0.75rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "auto",
            px: 1,
            py: 1,
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 4,
              bgcolor: "action.disabledBackground",
            },
          }}
        >
          {notifications.length === 0 ? (
            <Box
              sx={{
                py: 5,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
              }}
            >
              <NotificationsNoneRoundedIcon sx={{ fontSize: 52, opacity: 0.45 }} />
              <Typography variant="body2" textAlign="center" fontWeight={600}>
                {t("topbar.noNotifications")}
              </Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <ListItemButton
                key={`${notif.id}-${index}`}
                onClick={() => handleMarkRead(notif.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.75,
                  alignItems: "flex-start",
                  py: 1.25,
                  px: 1.5,
                  border: "1px solid",
                  borderColor: (theme) =>
                    !notif.read ? alpha(theme.palette.primary.main, 0.35) : theme.palette.divider,
                  bgcolor: (theme) =>
                    !notif.read
                      ? theme.palette.mode === "dark"
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.primary.main, 0.06)
                      : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.65)",
                  boxShadow: !notif.read
                    ? (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 2px 10px rgba(33,150,243,0.12)"
                          : "0 2px 8px rgba(25, 118, 210, 0.08)"
                    : "none",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {!notif.read ? (
                  <Box
                    sx={{
                      width: 6,
                      alignSelf: "stretch",
                      minHeight: 36,
                      borderRadius: 1,
                      bgcolor: "primary.main",
                      mr: 1.25,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <ListItemText
                  primary={notif.message}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: notif.read ? 400 : 700,
                    sx: { lineHeight: 1.55, wordBreak: "break-word" },
                  }}
                />
              </ListItemButton>
            ))
          )}
        </Box>

        {notifications.length > 0 ? (
          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              px: 1.5,
              py: 1.75,
              borderTop: "2px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(15, 23, 42, 0.08)",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(180deg, rgba(20,24,32,0.95) 0%, rgba(12,14,20,1) 100%)"
                  : "linear-gradient(180deg, #f0f4ff 0%, #e8ecf8 100%)",
            }}
          >
            <Button
              fullWidth
              variant="text"
              size="medium"
              onClick={handleMarkAllRead}
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
        ) : null}
      </Popover>
    </>
  );
}
