import { Box, Stack, Paper, Avatar, useTheme } from "@mui/material";

import { imageBaseUrl } from "../../../lib/config";
import SettingsMenu from "./Settings";
import NotificationsMenu from "./Notifications";
import LanguageSelector from "./LanguageSelector";
import TopbarLeft from "./TopbarLeft";
import { useGlobals } from "../../hooks/useGlobals";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar(props: TopbarProps) {
  const { onMenuClick } = props;
  const theme = useTheme();
  const { authMember } = useGlobals();

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

        {/* RIGHT SECTION */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LanguageSelector />
          <NotificationsMenu />
          <SettingsMenu />
          <Avatar
            alt="Profile"
            src={`${imageBaseUrl}/${authMember?.memberImage}`}
            sx={{ width: 36, height: 36, ml: 0.5 }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}
