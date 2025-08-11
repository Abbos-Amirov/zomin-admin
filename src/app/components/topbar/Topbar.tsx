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
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

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
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge color="error" badgeContent={5}>
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton size="small">
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>
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
