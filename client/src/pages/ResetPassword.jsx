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

import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { useResetPasswordMutation } from "../redux/slices/api/authApiSlice";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get email, token, and OTP from URL params or state
  const email = (() => {
    return (
      searchParams.get("email") ||
      location.state?.email ||
      sessionStorage.getItem("resetPasswordEmail")
    );
  });
  const [token] = useState(() => searchParams.get("token"));
  const [formData, setFormData] = useState({
    otp: searchParams.get("otp") || "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Clear session storage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("resetPasswordEmail");
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For OTP, only allow numbers and max 6 digits
    if (name === "otp") {
      const otpValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: otpValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await resetPassword({
        email: decodeURIComponent(email),
        token,
        otp: formData.otp,
        newPassword: formData.password,
      }).unwrap();

      if (result?.status) {
        toast.success(result.message || "Password has been reset successfully");
        navigate("/log-in");
      }
    } catch (error) {
      //console.error('Reset password error:', error);

      if (error?.data?.details) {
        const newErrors = {};
        Object.entries(error.data.details).forEach(([key, value]) => {
          if (key === "password") newErrors.password = value;
          if (key === "confirmPassword") newErrors.confirmPassword = value;
          if (key === "otp") newErrors.otp = value;
          if (key === "validation") {
            toast.error(value);
          }
        });
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        }
      } else {
        toast.error(error?.data?.message || "Failed to reset password");
      }
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Invalid Reset Request
          </h2>
          <p className="text-gray-400 mb-6">
            Email is missing from the request.
          </p>
          <Link
            to="/forgot-password"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Request Password Reset
          </Link>
        </div>
      </div>
    );
  }

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
            Reset Password
          </h2>
          <p className="text-center text-gray-400/80 text-sm mb-8">
            Enter your one-time password (OTP) and new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                className="block text-gray-300/90 text-sm pl-1"
                htmlFor="otp"
              >
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                  <FaKey className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-gray-300/90 text-sm pl-1"
                htmlFor="password"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400/80 hover:text-gray-300/80"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-gray-300/90 text-sm pl-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400/80 hover:text-gray-300/80"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-2.5 font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-400/80 hover:text-white transition-colors"
            >
              Request New OTP
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
