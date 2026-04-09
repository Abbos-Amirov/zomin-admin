import React from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import "../../../css/navbar.css";
import "../../../css/sidebar.css";
import { useTakeawayAckOptional } from "../../context/TakeawayAckContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:900px)");
  const takeawayAck = useTakeawayAckOptional();
  const takeawayPending = takeawayAck?.pendingAckCount ?? 0;

  const navItems = [
    {
      to: "/",
      label: t("sidebar.dashboard"),
      icon: <DashboardIcon className="sidebar-icon" />,
    },
    {
      to: "/order-status",
      label: t("sidebar.orderStatus"),
      icon: <AssignmentIcon className="sidebar-icon" />,
    },
    {
      to: "/products",
      label: t("sidebar.menu"),
      icon: <ReceiptLongIcon className="sidebar-icon" />,
    },
    {
      to: "/orders",
      label: t("sidebar.orders"),
      icon: <Inventory2Icon className="sidebar-icon" />,
    },
    {
      to: "/tables",
      label: t("sidebar.tables"),
      icon: <TableRestaurantIcon className="sidebar-icon" />,
    },
    {
      to: "/takeaway-orders",
      label: t("sidebar.takeawayOrders"),
      icon: <LocalShippingIcon className="sidebar-icon" />,
    },
    {
      to: "/user/all",
      label: t("sidebar.users"),
      icon: <AccountCircleIcon className="sidebar-icon" />,
    },
  ];

  const drawerContent = (
    <Box className="sidebar">
      <Box className="sidebar-title">{t("sidebar.adminPanel")}</Box>
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
              <ListItemIcon>
                {item.to === "/takeaway-orders" ? (
                  <Badge
                    badgeContent={takeawayPending > 0 ? takeawayPending : undefined}
                    color="error"
                    max={99}
                    overlap="circular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <Box component="span" sx={{ display: "inline-flex" }}>
                      {item.icon}
                    </Box>
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
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
