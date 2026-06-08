import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ToastContainer } from "react-fox-toast";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./utils/theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer
        position="top-right"
        isPausedOnHover={true}
        toastTypeTheming={{
          success: {
            className: "bg-green-600 text-white",
            style: {
              backgroundColor: "#f0e4d6",
              color: "#000000",
            },
          },
          error: {
            className: "bg-red-600 text-white",
            style: {
              backgroundColor: "#f5d9d9",
              color: "#000000",
            },
          },
          info: {
            className: "bg-blue-600 text-white",
            style: {
              backgroundColor: "#e8f0ff",
              color: "#000000",
            },
          },
          custom: {
            className: "bg-purple-600 text-white",
            style: {
              backgroundColor: "#9C27B0",
              color: "#fff",
            },
          },
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>
);
