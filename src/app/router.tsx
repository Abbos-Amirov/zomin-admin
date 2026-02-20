import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from '../screens/loginPage';
import SignupPage from '../screens/signupPage';

import DashboardPage from '../screens/dashboardPage';
import MenuPage from '../screens/menuPage';
import OrdersPage from '../screens/ordersPage';
import UsersPage from '../screens/usersPage';
import TablesPage from '../screens/tablesPage';

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
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
