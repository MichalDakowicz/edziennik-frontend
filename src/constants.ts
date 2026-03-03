export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://dziennik.polandcentral.cloudapp.azure.com/api";

export const POLL_INTERVAL_MS = 30_000;
export const TOKEN_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";
export const USER_KEY = "user";