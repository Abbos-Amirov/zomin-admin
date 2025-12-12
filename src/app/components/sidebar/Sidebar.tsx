import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  ListItemButton,
  Divider,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useGlobals } from "../../hooks/useGlobals";
import MemberService from "../../../services/Member.service";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../../../lib/sweetAlert";
import { Messages } from "../../../lib/config";

import "../../../css/navbar.css";
import "../../../css/sidebar.css";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const drawerWidth = 240;
  const { authMember, setAuthMember } = useGlobals();
  const navigate = useNavigate();

  /** HANDLERS **/
  const handleLogoutRequest = async () => {
    try {
      const member = new MemberService();
      await member.logout();
      await sweetTopSuccessAlert("Logged out successfully!", 700);
      setAuthMember(null);
      navigate("/login");
    } catch (err) {
      console.log(err);
      sweetErrorHandling(Messages.error1);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
    if (isMobile) onClose();
  };

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
      to: "/tables",
      label: "Tables",
      icon: <TableRestaurantIcon className="sidebar-icon" />,
    },
    {
      to: "/user/all",
      label: "Users",
      icon: <AccountCircleIcon className="sidebar-icon" />,
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
      
      <Box className="sidebar-auth-section">
        <Divider className="sidebar-auth-divider" />
        {authMember ? (
          <ListItemButton 
            className="sidebar-button sidebar-auth-button"
            onClick={handleLogoutRequest}
          >
            <ListItemIcon>
              <LogoutIcon className="sidebar-icon" />
            </ListItemIcon>
            <ListItemText className="sidebar-item" primary="Logout" />
          </ListItemButton>
        ) : (
          <ListItemButton 
            className="sidebar-button sidebar-auth-button"
            onClick={handleLoginClick}
          >
            <ListItemIcon>
              <LoginIcon className="sidebar-icon" />
            </ListItemIcon>
            <ListItemText className="sidebar-item" primary="Login" />
          </ListItemButton>
        )}
      </Box>
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
          classes={{ paper: "sidebar-drawer-paper" }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          classes={{ paper: "sidebar-drawer-paper" }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
