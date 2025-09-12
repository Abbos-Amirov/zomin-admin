import { useState } from "react";
import {
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  Button,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function NotificationsMenu({
  notifications,
}: {
  notifications: { id: string; message: string; status?: string; read?: boolean }[];
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Tooltip title="Notifications">
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
        PaperProps={{ style: { width: 320, maxHeight: 400 }}
        }
      >
        {notifications.length === 0 && <MenuItem>No notifications</MenuItem>}

        {notifications.map((notif) => (
          <MenuItem
            key={notif.id}
            selected={!notif.read}
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <ListItemText
              primary={notif.message}
              primaryTypographyProps={{
                style: { fontWeight: notif.read ? 400 : 600 },
              }}
            />

            {notif.status === "PENDING" && (
              <Box ml={2}>
                <Button variant="outlined" size="small">
                  Confirm
                </Button>
              </Box>
            )}
          </MenuItem>
        ))}

        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem>Mark all as read</MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
