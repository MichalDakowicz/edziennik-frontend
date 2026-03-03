import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { getCurrentUser } from "./services/auth";
import { getUserSettings } from "./services/api";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const applyTheme = async () => {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const profiles = await getUserSettings(user.id);
    const pref = profiles?.[0]?.theme_preference ?? "system";
    if (pref === "dark") document.documentElement.classList.add("dark");
    else if (pref === "light") document.documentElement.classList.remove("dark");
    else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    }
  } catch {
    document.documentElement.classList.remove("dark");
  }
};

void applyTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);