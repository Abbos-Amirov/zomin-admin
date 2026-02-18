import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useGlobals } from "../../hooks/useGlobals";

export default function NotificationsMenu() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, setNotifications } = useGlobals();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Mark single notif as read
  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // ✅ Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <Tooltip title={t("topbar.notifications")}>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ style: { width: 320, maxHeight: 400 } }}
      >
        {notifications.length === 0 && <MenuItem>{t("topbar.noNotifications")}</MenuItem>}

        {notifications.map((notif, index) => (
          <MenuItem
            key={`${notif.id}-${index}`}
            onClick={() => handleMarkRead(notif.id)}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: !notif.read ? "action.hover" : "inherit", // unread highlight
            }}
          >
            <ListItemText
              primary={notif.message}
              primaryTypographyProps={{
                style: { fontWeight: notif.read ? 400 : 600 },
              }}
            />
          </MenuItem>
        ))}

        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem onClick={handleMarkAllRead}>{t("topbar.markAllRead")}</MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
