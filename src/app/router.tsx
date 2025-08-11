import { Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout';

import DashboardPage from '../screens/dashboardPage';
import MenuPage from '../screens/menuPage';
import OrdersPage from '../screens/ordersPage';
import UsersPage from '../screens/usersPage';
import TableCallsPage from '../screens/tableCallsPage';
import TablesPage from '../screens/tablesPage';

const AppRouter = () => (
  <Routes>
    <Route path="/products" element={<MainLayout><MenuPage /></MainLayout>} />
    <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />
    <Route path="/user/all" element={<MainLayout><UsersPage /></MainLayout>} />
    <Route path="/calls" element={<MainLayout><TableCallsPage /></MainLayout>} />
    <Route path="/tables" element={<MainLayout><TablesPage /></MainLayout>} />
    <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
  </Routes>
);

export default AppRouter;
