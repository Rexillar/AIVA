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
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useRegisterMutation,
  useVerifyOTPMutation,
} from "../redux/slices/api/authApiSlice";
import { toast } from "sonner";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaKey,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

  const invitationId = searchParams.get("invitation");

  // Real-time password strength calculation
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    const passwordChecks = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
      special: /[@$!%*?&]/.test(formData.password),
    };

    const strength = Object.values(passwordChecks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
        special: /[@$!%*?&]/.test(formData.password),
      };

      if (!passwordChecks.length) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!passwordChecks.uppercase) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!passwordChecks.lowercase) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!passwordChecks.number) {
        newErrors.password = "Password must contain at least one number";
      } else if (!passwordChecks.special) {
        newErrors.password =
          "Password must contain at least one special character (@$!%*?&)";
      }
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};
    if (!formData.otp) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (step === 1) {
        if (!validateForm()) {
          setIsSubmitting(false);
          return;
        }

        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }).unwrap();

        if (result.status) {
          setStep(2);
          // Store email temporarily for OTP verification
          sessionStorage.setItem(
            "registrationEmail",
            formData.email.toLowerCase(),
          );
          toast.success(
            result.message || "Please check your email for verification code.",
          );
        }
      } else {
        // Step 2: Verify OTP
        if (!validateOTP()) {
          setIsSubmitting(false);
          return;
        }

        const storedEmail = sessionStorage.getItem("registrationEmail");
        if (!storedEmail) {
          toast.error("Registration session expired. Please try again.");
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        try {
          const result = await verifyOTP({
            email: storedEmail,
            otp: formData.otp.trim(),
          }).unwrap();

          if (result.status) {
            toast.success("Email verified successfully! Redirecting...");
            // The auth state should be automatically updated by the verifyOTP mutation
            // Just need to handle navigation
            if (invitationId) {
              navigate(`/workspace/invitation?invitation=${invitationId}`);
            } else {
              navigate("/dashboard");
            }
          }
        } catch (error) {
          //console.error('OTP Verification Error:', error);
          const errorMessage =
            error.data?.message ||
            error.message ||
            "Invalid verification code. Please try again.";
          toast.error(errorMessage);

          if (errorMessage.toLowerCase().includes("expired")) {
            // If OTP expired, go back to step 1
            setStep(1);
            sessionStorage.removeItem("registrationEmail");
          } else if (errorMessage.toLowerCase().includes("invalid")) {
            // Clear OTP field for invalid code
            setFormData((prev) => ({ ...prev, otp: "" }));
          }
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      //console.error('Registration Error:', err);
      const errorMessage =
        err.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);

      // If user already exists and verified, redirect to login
      if (errorMessage.includes("already exists")) {
        toast.info("Please log in to your account");
        setTimeout(() => {
          navigate("/log-in");
        }, 2000);
      }
      setIsSubmitting(false);
    }
  };

  // Add password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Add password strength indicator component
  const PasswordStrengthIndicator = () => {
    const getStrengthColor = () => {
      switch (passwordStrength) {
        case 5:
          return "bg-green-500";
        case 4:
          return "bg-blue-500";
        case 3:
          return "bg-yellow-500";
        case 2:
          return "bg-orange-500";
        default:
          return "bg-red-500";
      }
    };

    const getStrengthText = () => {
      switch (passwordStrength) {
        case 5:
          return "Very Strong";
        case 4:
          return "Strong";
        case 3:
          return "Medium";
        case 2:
          return "Weak";
        default:
          return "Very Weak";
      }
    };

    return formData.password ? (
      <div className="mt-1">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            />
          </div>
          <span
            className={`text-xs ${getStrengthColor().replace("bg-", "text-")}`}
          >
            {getStrengthText()}
          </span>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="relative backdrop-blur-xl bg-white/[0.02] rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/[0.05]">
          {/* Morphic glow effects */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-50" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl rotate-180 blur-xl opacity-30" />

          <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent text-center mb-6">
            {step === 1 ? "Create your account" : "Verify your email"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-gray-300/90 text-sm pl-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                      <FaUser className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-400/90 pl-1">
                      {errors.name}
                    </p>
                  )}
                </div>

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
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400/90 pl-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-gray-300/90 text-sm pl-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                      <FaLock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400/80 hover:text-gray-300/80 transition-colors"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthIndicator />
                  <div className="py-1 px-3 mt-1 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                    <ul className="text-xs text-gray-400/80 flex flex-wrap gap-x-3">
                      <li
                        className={`flex items-center gap-1 ${formData.password?.length >= 8 ? "text-green-400" : ""}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${formData.password?.length >= 8 ? "bg-green-400" : "bg-gray-400/80"}`}
                        ></span>
                        8+
                      </li>
                      <li
                        className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? "text-green-400" : ""}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? "bg-green-400" : "bg-gray-400/80"}`}
                        ></span>
                        ABC
                      </li>
                      <li
                        className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? "text-green-400" : ""}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${/[a-z]/.test(formData.password) ? "bg-green-400" : "bg-gray-400/80"}`}
                        ></span>
                        abc
                      </li>
                      <li
                        className={`flex items-center gap-1 ${/\d/.test(formData.password) ? "text-green-400" : ""}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${/\d/.test(formData.password) ? "bg-green-400" : "bg-gray-400/80"}`}
                        ></span>
                        123
                      </li>
                      <li
                        className={`flex items-center gap-1 ${/[@$!%*?&]/.test(formData.password) ? "text-green-400" : ""}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${/[@$!%*?&]/.test(formData.password) ? "bg-green-400" : "bg-gray-400/80"}`}
                        ></span>
                        @#$
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 mt-8">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-300/90 text-sm pl-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                      <FaLock className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400/80 hover:text-gray-300/80 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400/90 pl-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="block text-gray-300/90 text-sm pl-1"
                  >
                    Enter OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400/80">
                      <FaKey className="h-5 w-5" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 px-4 py-2.5 text-white placeholder-gray-400/50 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-sm text-red-400/90 pl-1">{errors.otp}</p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={step === 1 ? isRegistering : isVerifying}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-2.5 font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0F172A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1
                ? isRegistering
                  ? "Creating account..."
                  : "Create account"
                : isVerifying
                  ? "Verifying..."
                  : "Verify OTP"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
