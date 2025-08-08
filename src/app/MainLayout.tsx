import { PropsWithChildren, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { Box, Stack } from "@mui/material";

const drawerWidth = 240;

const MainLayout = ({ children }: PropsWithChildren) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Stack direction="row">
      {/* Sidebar (mobile + desktop) */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      <Box
        sx={{
          width: "100%",
          marginLeft: { xs: 0, md: `${drawerWidth}px` },
        }}
      >
        <Topbar onMenuClick={handleDrawerToggle} />
        <Box p={2} sx={{ mt: 8 }}>
          {children}
        </Box>
      </Box>
    </Stack>
  );
};

export default MainLayout;
