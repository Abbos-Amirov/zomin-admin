import { useState } from "react";
import {
  Box,
  Stack,
  Paper,
  IconButton,
  Badge,
  Avatar,
  InputBase,
  useTheme,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CircleIcon from "@mui/icons-material/Circle";



interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = (props: TopbarProps) => {
  const { onMenuClick } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

  // --- Notifications State ---
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order #123 received", read: false },
    { id: 2, text: "Table 5 pressed service button", read: false },
    { id: 3, text: "Stock alert: Chicken running low", read: true },
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: theme.zIndex.appBar,
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={1}
        sx={{
          height: 64,
          borderRadius: 0,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        {/* LEFT SECTION: Menu + Search */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
          {isMobile && (
            <IconButton
              color="primary"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Search Box */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              flex: 1,
              maxWidth: 560,
              bgcolor: "background.default",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchRoundedIcon fontSize="small" />
            {!isMobile && (
              <InputBase
                placeholder="Search…"
                fullWidth
                sx={{
                  fontSize: 14,
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* RIGHT SECTION: Icons + Avatar */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton size="small" onClick={handleNotifClick}>
              <Badge color="error" badgeContent={unreadCount}>
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleNotifClose}
            PaperProps={{ sx: { width: 280 } }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1}
            >
              <Typography variant="subtitle1">Notifications</Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </Stack>
            <Divider />

            {notifications.length === 0 ? (
              <Typography variant="body2" sx={{ p: 2, textAlign: "center" }}>
                No notifications
              </Typography>
            ) : (
              notifications.map((n) => (
                <MenuItem
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    handleNotifClose();
                  }}
                  sx={{ bgcolor: n.read ? "inherit" : "action.hover" }}
                >
                  <ListItemIcon>
                    {!n.read && (
                      <CircleIcon
                        fontSize="small"
                        color="error"
                        sx={{ fontSize: 10 }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={n.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: n.read ? "normal" : "bold",
                    }}
                  />
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton size="small">
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Avatar
            alt="Profile"
            src="https://i.pravatar.cc/100?img=3"
            sx={{ width: 36, height: 36, ml: 0.5 }}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default Topbar;
