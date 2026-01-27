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

   ⟁  PURPOSE      : Manage user authentication state

   ⟁  WHY          : Secure client-side authentication handling

   ⟁  WHAT         : Redux slice for user sessions and auth state

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : JWT • LocalStorage
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/frontend/state-management.md

   ⟁  USAGE RULES  : Immutable updates • Action types • Error handling

        "Authentication managed. Sessions secure. Users verified."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
 
import { apiSlice } from "../../slices/apiSlice";
import {
  setCredentials,
  setPrivateWorkspace,
  setPublicWorkspaces,
} from "../authSlice";
import { setCurrentWorkspace } from "../workspaceSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `/auth/login`,
        method: "POST",
        body: credentials,
        credentials: "include",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.status && data?.data) {
            const { user, token, workspaceId } = data.data;
            // Set credentials first
            dispatch(setCredentials({ user, token }));

            // Then set workspace data if available
            if (data.data.privateWorkspace) {
              dispatch(setPrivateWorkspace(data.data.privateWorkspace));
            }
            if (data.data.publicWorkspaces) {
              dispatch(setPublicWorkspaces(data.data.publicWorkspaces));
            }

            // If there's a specific workspace from invitation, set it as current
            if (workspaceId) {
              dispatch(setCurrentWorkspace(workspaceId));
            }
          }
        } catch (error) {
          // console.error('Login error:', error);
          // Clear any existing credentials on error
          dispatch(setCredentials(null));
        }
      },
      invalidatesTags: ["User", "Workspace"],
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `/auth/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: `/auth/verify-otp`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;

          if (response?.status && response?.data) {
            const { user, token, workspace } = response.data;
            if (user && token) {
              dispatch(setCredentials({ user, token }));

              // Set workspace data if available
              if (workspace) {
                dispatch(setPrivateWorkspace(workspace));
              }

              // Clear registration data
              sessionStorage.removeItem("registrationEmail");
              sessionStorage.removeItem("registrationData");
            }
          }
        } catch (error) {
          // console.error('OTP verification error:', error);
          // Don't throw here - let component handle the error
        }
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to verify OTP");
        }
        return response;
      },
      transformErrorResponse: (error) => ({
        status: false,
        message: error.data?.message || "Invalid verification code",
        error: error.data || error,
      }),
      invalidatesTags: ["User", "Workspace"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: `/auth/logout`,
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setCredentials(null));
          dispatch(setPrivateWorkspace(null));
          dispatch(setPublicWorkspaces([]));
          dispatch(setCurrentWorkspace(null));
        } catch (error) {
          // console.error('Logout error:', error);
        }
      },
      invalidatesTags: ["User", "Task", "Workspace", "Notification"],
    }),
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password-request`,
        method: "POST",
        body: data,
      }),
      // Handle response and errors properly
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Only store email in session storage if request was successful
          if (data?.status && data?.data?.email) {
            sessionStorage.setItem(
              "resetPasswordEmail",
              data.data.email.toLowerCase(),
            );
          }
        } catch (error) {
          // Log error but don't throw - let component handle the error display
          // console.error('Reset password request error:', {
          //   status: error?.error?.status,
          //   message: error?.error?.data?.message || 'Failed to process request'
          // });
        }
      },
      // Transform success response
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(
            response?.message || "Failed to process password reset request",
          );
        }
        return {
          status: true,
          message:
            response.message || "Password reset instructions sent successfully",
          data: response.data,
        };
      },
      // Transform error response to be more user-friendly
      transformErrorResponse: (response) => ({
        status: false,
        message:
          response.data?.message ||
          "Failed to send reset instructions. Please try again.",
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: "POST",
        body: {
          email: data.email?.toLowerCase(),
          token: data.token || null,
          otp: data.otp || null,
          newPassword: data.newPassword,
        },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.status) {
            sessionStorage.removeItem("resetPasswordEmail");
          }
        } catch (error) {
          // console.error('Reset password error:', {
          //   status: error?.error?.status,
          //   message: error?.error?.data?.message || 'Failed to reset password',
          //   details: error?.error?.data?.details || {}
          // });
        }
      },
      transformResponse: (response) => {
        if (!response?.status) {
          throw new Error(response?.message || "Failed to reset password");
        }
        return {
          status: true,
          message: response.message || "Password reset successful",
          data: response.data,
        };
      },
      transformErrorResponse: (response) => ({
        status: false,
        message:
          response.data?.message ||
          "Failed to reset password. Please try again.",
        details: response.data?.details || {},
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    resendOTP: builder.mutation({
      query: (data) => ({
        url: `/auth/resend-otp`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useResendOTPMutation,
} = authApiSlice;
