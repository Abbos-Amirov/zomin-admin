import { PropsWithChildren, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { Box, Stack } from "@mui/material";

const drawerWidth = 240;
const TOPBAR_HEIGHT = 64; // keep in sync with Topbar

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Stack direction="row" sx={{minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${drawerWidth}px` }, // make room for the permanent drawer on md+
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky top bar */}
        <Topbar onMenuClick={handleDrawerToggle} />

        {/* Page content */}
        <Box
          sx={{
            px: { xs: 1, sm: 2 },
            py: 2,
            // If you ever switch Topbar back to fixed AppBar, use pt to offset instead:
            // pt: `${TOPBAR_HEIGHT + 8}px`,
          }}
        >
          {children}
        </Box>
      </Box>
    </Stack>
  );
};

export default MainLayout;
