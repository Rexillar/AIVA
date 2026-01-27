/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : STATE MANAGEMENT

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL || "";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithRetry = async (args, api, extraOptions) => {
  const queryArgs = {
    ...args,
    url: args?.url?.startsWith("/api/")
      ? args.url
      : `/api/${args?.url?.startsWith("/") ? args.url.substring(1) : args.url || ""}`,
  };

  const token = api.getState()?.auth?.token;
  const isAuthRoute = queryArgs.url.includes("auth/");
  const isPublicRoute = queryArgs.url.includes("public");

  // Only require token for protected routes
  if (!token && !isAuthRoute && !isPublicRoute) {
    return {
      error: {
        status: 401,
        data: { message: "Authentication required" },
      },
    };
  }

  try {
    let result = await baseQuery(queryArgs, api, extraOptions);

    // Don't retry on 404s or if explicitly marked as no-retry
    if (result.error) {
      const status = result.error.status;
      const message = result.error.data?.message;
      const isCreateWorkspacePage =
        window.location.pathname === "/create-workspace";

      // Don't retry or show errors for expected cases
      if (status === 404 || status === 401 || isCreateWorkspacePage) {
        return result;
      }

      // Don't show toast for network connectivity errors
      const isNetworkError = 
        status === "FETCH_ERROR" ||
        status >= 500 ||
        message?.toLowerCase().includes('network') ||
        message?.toLowerCase().includes('connection') ||
        message?.toLowerCase().includes('fetch');

      // Show error message for unexpected errors (but not network issues)
      if (message && !isNetworkError) {
        toast.error(message);
      } else if (isNetworkError) {
        console.warn('Network error suppressed:', message);
      }
    }

    return result;
  } catch (err) {
    return {
      error: {
        status: "FETCH_ERROR",
        data: { message: "Failed to process request" },
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Task", "Tasks", "User", "Workspace", "Notification", "Dashboard"],
  endpoints: (builder) => ({
    genericApiCall: builder.mutation({
      query: ({ method, url, body }) => ({
        url,
        method,
        body,
      }),
    }),
  }),
});

export const { useGenericApiCallMutation } = apiSlice;
