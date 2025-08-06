import React from 'react';
import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Sidebar() {
  return (
    <div className="sidebar" color={""}>
      <Container className="sidebar-container">
        <Box className="title">Admin panel</Box>
        <ul className="sidebar-items">
          <li className="sidebar-item">
            <NavLink to="/dashboard" className="nav-link" activeClassName="active">
              <DashboardIcon className="nav-icon" /> Dashboard
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/products" className="nav-link" activeClassName="active">
              <ReceiptLongIcon className="nav-icon" /> Menu
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/orders" className="nav-link" activeClassName="active">
              <Inventory2Icon className="nav-icon" /> Orders
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/admin-profile" className="nav-link" activeClassName="active">
              <AccountCircleIcon className="nav-icon" /> Profile
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/tables" className="nav-link" activeClassName="active">
              <TableRestaurantIcon className="nav-icon" /> Tables
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/calls" className="nav-link" activeClassName="active">
              <NotificationsIcon className="nav-icon" /> TableCalls
            </NavLink>
          </li>
        </ul>
      </Container>
    </div>
  );
}
