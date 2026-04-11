import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@schoolos/api";
import App from "./App.js";
import { useAuthStore } from "./store/authStore.js";
import "./index.css";

const queryClient = createQueryClient();

// Hydrate auth state from stored tokens on startup
void useAuthStore.getState().hydrate();

// Listen for auth:logout events (fired by API client on 401 refresh failure)
window.addEventListener("auth:logout", () => {
  void useAuthStore.getState().logout();
});

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
