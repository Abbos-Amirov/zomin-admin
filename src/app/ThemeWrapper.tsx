import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import getTheme from "./MaterialTheme";
import { useGlobals } from "./hooks/useGlobals";
import App from "../App";

export default function ThemeWrapper() {
  const { darkMode } = useGlobals();
  const theme = React.useMemo(() => getTheme(darkMode), [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
