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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import { useRequestPasswordResetMutation } from "../redux/slices/api/authApiSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [requestPasswordReset, { isLoading }] =
    useRequestPasswordResetMutation();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await requestPasswordReset({
        email: email.toLowerCase(),
      }).unwrap();

      if (result?.status) {
        setEmailSent(true);
        toast.success(result.message || "Reset instructions sent successfully");

        // Only navigate if we have the email in the response
        if (result.data?.email) {
          // Store email in session storage for persistence
          sessionStorage.setItem(
            "resetPasswordEmail",
            result.data.email.toLowerCase(),
          );

          // Navigate to reset password page after a delay
          setTimeout(() => {
            navigate("/reset-password", {
              state: { email: result.data.email.toLowerCase() },
            });
          }, 3000);
        }
      } else {
        toast.error(result.message || "Failed to send reset instructions");
        setEmailSent(false);
      }
    } catch (error) {
      //console.error('Password reset request failed:', error);

      // Handle specific error cases
      if (error?.status === 400) {
        toast.error("Please enter a valid email address");
      } else if (error?.status === 429) {
        toast.error("Too many attempts. Please try again later.");
      } else if (error?.status === 404) {
        // Don't reveal if user exists
        toast.success(
          "If an account exists with this email, you will receive reset instructions shortly.",
        );
        setEmailSent(true);
      } else {
        toast.error(
          error.message ||
            "Failed to send reset instructions. Please try again.",
        );
      }

      setEmailSent(false);
    }
  };

  const handleTryAgain = () => {
    setEmail("");
    setEmailSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="relative backdrop-blur-xl bg-white/[0.02] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/[0.05]">
          {/* Morphic glow effects */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-50" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl rotate-180 blur-xl opacity-30" />

          <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent text-center mb-2">
            Forgot Password
          </h2>
          <p className="text-center text-gray-400/80 text-sm mb-8">
            {emailSent
              ? "Please check your email for password reset instructions."
              : "Enter your email address and we'll send you instructions to reset your password."}
          </p>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-gray-300/90 text-sm pl-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                    <FaEnvelope className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-2.5 font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending Instructions..." : "Send Instructions"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-blue-400 text-sm">
                  If an account exists with this email, you&apos;ll receive password
                  reset instructions shortly.
                </p>
              </div>
              <button
                onClick={handleTryAgain}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-2.5 text-gray-300/90 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/log-in"
              className="text-sm text-gray-400/80 hover:text-white transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
