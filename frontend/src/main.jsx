import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            padding: "12px 18px",
            background: "#fff",
            color: "#1e293b",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
            style: { borderLeft: "4px solid #22c55e" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: { borderLeft: "4px solid #ef4444" },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
