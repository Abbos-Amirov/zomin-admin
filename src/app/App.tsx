import React from 'react';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import DashboardPage from './screens/dashboardPage';
import MenuPage from './screens/menuPage';
import OrdersPage from './screens/ordersPage';
import ProfilePage from './screens/profilePage';
import TablesPage from './screens/tablesPage';
import TableCallsPage from './screens/tableCallsPage';
import Sidebar from './components/sidebar/Sidebar';

import '../css/app.css';
import '../css/navbar.css';

export default function App() {
  return (
    <div className="app-wrapper">
      <div className="app-inner">
        <Sidebar />
        <div className="main-area">
          <Switch>
            <Route path="/dashboard">
              <DashboardPage />
            </Route>
            <Route path="/products">
              <MenuPage />
            </Route>
            <Route path="/orders">
              <OrdersPage />
            </Route>
            <Route path="/admin-profile">
              <ProfilePage />
            </Route>
            <Route path="/tables">
              <TablesPage />
            </Route>
            <Route path="/calls">
              <TableCallsPage />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
