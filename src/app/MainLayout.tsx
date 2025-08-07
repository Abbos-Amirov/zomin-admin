import { PropsWithChildren } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { Box, Stack } from "@mui/material";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack direction="row">
      <Sidebar />
      <Box sx={{ marginLeft: "240px", width: "100%" }}>
        <Topbar />
        <Box p={2}>{children}</Box>
      </Box>
    </Stack>
  );
};

export default MainLayout;
