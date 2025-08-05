import React from 'react';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import  DashboardPage  from './screens/DashboardPage';
import  MenuPage  from './screens/MenuPage';
import  OrdersPage  from './screens/OrdersPage';
import  ProfilePage  from './screens/ProfilePage';
import  TablesPage  from './screens/TablesPage';
// import  HomeNavbar  from './components/headers/HomeNavbar';
// import  OtherNavbar  from './components/headers/OtherNavbar';
// import  Footer  from './components/footer';
// import '../css/app.css';
// import '../css/navbar.css';
// import '../css/footer.css';

export default function App() {
  const location = useLocation();
  console.log('location',location);
  return (
    <>
      {/* {location.pathname === '/' ? <HomeNavbar /> : <OtherNavbar />} */}
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
          <TablesPage/>
        </Route>
      </Switch>
      {/* <Footer /> */}
    </>
  );
};
