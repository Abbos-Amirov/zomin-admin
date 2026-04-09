import { PropsWithChildren, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { Box, Stack } from "@mui/material";
import "../css/mainLayout.css";
import { TakeawayAckProvider } from "./context/TakeawayAckContext";

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <TakeawayAckProvider>
    <Stack
      direction="row"
      className="main-layout-container"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
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
    </TakeawayAckProvider>
  );
};

export default MainLayout;
