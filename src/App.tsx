import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/router";
import NotificationAlertDialog from "./app/components/topbar/NotificationAlertDialog";
import "./css/index.css";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <AppRouter />
      <NotificationAlertDialog />
    </BrowserRouter>
  );
}

export default App;
