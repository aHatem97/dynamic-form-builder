import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { FormsProvider } from "./context/FormsProvider";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <CssBaseline />

    <FormsProvider>
      <App />
    </FormsProvider>
  </BrowserRouter>,
  // </StrictMode>,
);
