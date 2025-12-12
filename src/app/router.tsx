import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardPage from '../screens/dashboardPage';
import MenuPage from '../screens/menuPage';
import OrdersPage from '../screens/ordersPage';
import UsersPage from '../screens/usersPage';
import TablesPage from '../screens/tablesPage';
import LoginPage from '../screens/loginPage';
import { useGlobals } from './hooks/useGlobals';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { authMember } = useGlobals();
  
  if (authMember) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRouter = () => (
  <Routes>
    <Route 
      path="/login" 
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } 
    />
    <Route 
      path="/products" 
      element={
        <ProtectedRoute>
          <MainLayout><MenuPage /></MainLayout>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/orders" 
      element={
        <ProtectedRoute>
          <MainLayout><OrdersPage /></MainLayout>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/user/all" 
      element={
        <ProtectedRoute>
          <MainLayout><UsersPage /></MainLayout>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/tables" 
      element={
        <ProtectedRoute>
          <MainLayout><TablesPage /></MainLayout>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/" 
      element={
        <ProtectedRoute>
          <MainLayout><DashboardPage /></MainLayout>
        </ProtectedRoute>
      } 
    />
  </Routes>
);

export default AppRouter;
