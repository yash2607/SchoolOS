import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@schoolos/api";
import App from "./App.js";
import "./index.css";

const queryClient = createQueryClient();

const root = document.getElementById("root");
if (!root) throw new Error("No root element found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
