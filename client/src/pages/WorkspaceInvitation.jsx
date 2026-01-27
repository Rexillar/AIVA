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

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../components/shared/buttons/Button";
import { Textbox } from "../components/shared/inputs/Textbox";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { Navbar } from "../components/layout/navigation/Navbar";
import {
  useHandleWorkspaceInvitationMutation,
  useGetWorkspaceInvitationDetailsQuery,
} from "../redux/slices/api/workspaceApiSlice";
import {
  useRegisterMutation,
  useVerifyOTPMutation,
} from "../redux/slices/api/authApiSlice";

const WorkspaceInvitation = () => {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isAccepting, setIsAccepting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Get the action from the URL path
  const action = location.pathname.includes("/accept")
    ? "accept"
    : location.pathname.includes("/reject")
      ? "reject"
      : null;

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
  } = useGetWorkspaceInvitationDetailsQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [handleInvitation] = useHandleWorkspaceInvitationMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

  useEffect(() => {
    if (!workspaceId) {
      navigate("/dashboard");
    }
  }, [workspaceId, navigate]);

  useEffect(() => {
    // If we have a direct accept/reject action and the user is authenticated, handle it automatically
    const handleDirectAction = async () => {
      if (action && isAuthenticated && workspaceData?.data) {
        try {
          setIsAccepting(true);
          const response = await handleInvitation({
            workspaceId,
            action,
          }).unwrap();

          if (response.status) {
            toast.success(`Successfully ${action}ed the workspace invitation`);
            if (action === "accept") {
              navigate(`/workspace/${workspaceId}/dashboard`);
            } else {
              navigate("/dashboard");
            }
          }
        } catch (error) {
          //console.error(`Error ${action}ing invitation:`, error);
          toast.error(error?.data?.message || `Failed to ${action} invitation`);
          navigate(`/workspace/invitation?id=${workspaceId}`);
        } finally {
          setIsAccepting(false);
        }
      }
    };

    handleDirectAction();
  }, [
    action,
    isAuthenticated,
    workspaceId,
    workspaceData,
    handleInvitation,
    navigate,
  ]);

  const handleRegistration = async (data) => {
    try {
      const response = await registerUser({
        email: data.email,
        name: data.name,
        password: data.password,
        invitationId: workspaceId,
      }).unwrap();

      if (response) {
        toast.success(
          "Registration successful! Please check your email for the OTP.",
        );
        setEmail(data.email);
        setOtpSent(true);
      }
    } catch (error) {
      //console.error("Registration Error:", error);
      toast.error(error?.data?.message || error.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("OTP cannot be empty.");
      return;
    }
    try {
      const response = await verifyOTP({
        email,
        otp,
        invitationId: workspaceId,
      }).unwrap();

      toast.success("OTP verified successfully!");

      if (workspaceId && response.workspaceId) {
        navigate(`/workspace/${response.workspaceId}/dashboard`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      //console.error("OTP Verification Error:", error);
      toast.error(error?.data?.message || error.message);
    }
  };

  if (isLoadingWorkspace || isAccepting) {
    return (
      <div className="w-full min-h-screen bg-[#f3f4f6] dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!workspaceData?.data) {
    return (
      <div className="w-full min-h-screen bg-[#f3f4f6] dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This workspace invitation is invalid or has expired.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const workspace = workspaceData.data;

  // If we're on a direct accept/reject URL and not authenticated, redirect to login
  if (action && !isAuthenticated) {
    navigate(`/log-in?invitation=${workspaceId}`);
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#f3f4f6] dark:bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-lg p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Workspace Invitation
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {workspace.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {workspace.description}
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Owner: {workspace.owner?.name}</p>
                <p>Members: {workspace.members?.length || 0}</p>
                <p>Visibility: {workspace.visibility}</p>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex justify-center gap-4">
              {isAccepting ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <Button
                    onClick={async () => {
                      try {
                        setIsAccepting(true);
                        const response = await handleInvitation({
                          workspaceId,
                          action: "accept",
                        }).unwrap();

                        if (response.status) {
                          toast.success("Successfully joined the workspace!");
                          navigate(`/workspace/${workspaceId}/dashboard`);
                        }
                      } catch (error) {
                        //console.error('Error accepting invitation:', error);
                        toast.error(
                          error?.data?.message || "Failed to accept invitation",
                        );
                      } finally {
                        setIsAccepting(false);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Accept Invitation
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        setIsAccepting(true);
                        const response = await handleInvitation({
                          workspaceId,
                          action: "reject",
                        }).unwrap();

                        if (response.status) {
                          toast.success("Invitation rejected");
                          navigate("/dashboard");
                        }
                      } catch (error) {
                        //console.error('Error rejecting invitation:', error);
                        toast.error(
                          error?.data?.message || "Failed to reject invitation",
                        );
                      } finally {
                        setIsAccepting(false);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div>
              {otpSent ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Please enter the OTP sent to your email
                    </p>
                  </div>
                  <Textbox
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full"
                  />
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isVerifying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isVerifying ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(handleRegistration)}
                  className="space-y-4"
                >
                  <Textbox
                    placeholder="Your Name"
                    type="text"
                    label="Name"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    error={errors.name?.message}
                  />
                  <Textbox
                    placeholder="email@example.com"
                    type="email"
                    label="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    error={errors.email?.message}
                  />
                  <Textbox
                    placeholder="Password"
                    type="password"
                    label="Password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    error={errors.password?.message}
                  />
                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRegistering
                      ? "Creating Account..."
                      : "Create Account & Join"}
                  </Button>
                </form>
              )}
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() =>
                      navigate(`/log-in?invitation=${workspaceId}`)
                    }
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceInvitation;
