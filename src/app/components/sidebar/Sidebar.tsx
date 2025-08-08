import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  ListItemButton,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import NotificationsIcon from "@mui/icons-material/Notifications";

import "../../../css/navbar.css";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const drawerWidth = 240;

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <DashboardIcon className="sidebar-icon" />,
    },
    {
      to: "/products",
      label: "Menu",
      icon: <ReceiptLongIcon className="sidebar-icon" />,
    },
    {
      to: "/orders",
      label: "Orders",
      icon: <Inventory2Icon className="sidebar-icon" />,
    },
    {
      to: "/admin-profile",
      label: "Profile",
      icon: <AccountCircleIcon className="sidebar-icon" />,
    },
    {
      to: "/tables",
      label: "Tables",
      icon: <TableRestaurantIcon className="sidebar-icon" />,
    },
    {
      to: "/calls",
      label: "Table Calls",
      icon: <NotificationsIcon className="sidebar-icon" />,
    },
  ];

  const drawerContent = (
    <Box className="sidebar">
      <Box className="sidebar-title">Admin Panel</Box>
      <List className="sidebar-list">
        {navItems.map((item) => (
          <NavLink
            to={item.to}
            key={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={isMobile ? onClose : undefined}
          >
            <ListItemButton className="sidebar-button">
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText className="sidebar-item" primary={item.label} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;