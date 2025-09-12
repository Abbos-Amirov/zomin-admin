import {
  Box,
  Stack,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { serverApi } from "../../../lib/config";
import SettingsMenu from "./Settings";
import NotificationsMenu from "./Notifications";
import TopbarLeft from "./TopbarLeft";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar(props: TopbarProps) {
  const { onMenuClick } = props;
  const theme = useTheme();

  // mock authMember
  const authMember = { memberImage: "profile.png" };

  // mock notifications
  const notifications = [
    {
      id: "1",
      message: "Table 5 placed a new order",
      status: "PENDING",
      read: false,
    },
    { id: "2", message: "Order #123 is ready", status: "PROCESS", read: false },
  ];

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: theme.zIndex.appBar }}>
      <Paper
        elevation={1}
        sx={{
          height: 64,
          borderRadius: 0,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT SECTION */}
        <TopbarLeft onMenuClick={onMenuClick} />

        {/* RIGHT SECTION stays same */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <NotificationsMenu notifications={notifications} />
          <SettingsMenu darkMode={false} language="EN" />
          <Avatar
            alt="Profile"
            src={`${serverApi}/${authMember?.memberImage}`}
            sx={{ width: 36, height: 36, ml: 0.5 }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}
