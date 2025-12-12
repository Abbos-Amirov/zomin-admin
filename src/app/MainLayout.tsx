import { PropsWithChildren, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { Box, Stack } from "@mui/material";
import "../css/mainLayout.css";

const drawerWidth = 240;
const TOPBAR_HEIGHT = 64; // keep in sync with Topbar

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Stack direction="row" className="main-layout-container">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box component="main" className="main-layout-content">
        {/* Sticky top bar */}
        <Topbar onMenuClick={handleDrawerToggle} />

        {/* Page content */}
        <Box className="main-layout-page-content">
          {children}
        </Box>
      </Box>
    </Stack>
  );
};

export default MainLayout;
