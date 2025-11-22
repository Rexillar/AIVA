/*=================================================================
 * Project: AIVA-WEB
 * File: ChangePassword.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Component for handling password changes, including validation
 * and submission of new passwords.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import {
  useRequestPasswordResetMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
} from "../../redux/slices/api/authApiSlice";
import { Button } from "../shared/buttons/Button";
import { ModalWrapper } from "../shared/dialog/ModalWrapper";
import { Textbox } from "../shared/inputs/Textbox";
import { Loading } from "../shared/feedback/Loader";

const ChangePassword = ({ open, setOpen }) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const email = watch("email");
  const [requestPasswordReset, { isLoading: isOtpRequestLoading }] =
    useRequestPasswordResetMutation();
  const [resetPassword, { isLoading: isPasswordLoading }] =
    useResetPasswordMutation();
  const [verifyOTP] = useVerifyOTPMutation();

  useEffect(() => {
    if (!open) {
      reset();
      setIsOtpSent(false);
    }
  }, [open, reset]);

  const handleOtpRequest = async (data) => {
    if (!data.email) {
      toast.error("Email is required to request OTP.");
      return;
    }
    try {
      const response = await requestPasswordReset({
        email: data.email,
      }).unwrap();
      setIsOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error) {
      if (error?.data?.message === "User with the provided email not found.") {
        toast.error("Email not found in the system.");
      } else {
        toast.error("There was an error sending the OTP. Please try again.");
      }
      //console.error(error?.data?.message || error.error);
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (data.password !== data.cpass) {
      toast.warning("Passwords do not match");
      return;
    }
    try {
      if (data.password.length < 8) {
        toast.warning("Password must be at least 8 characters long");
        return;
      }

      await resetPassword({
        email,
        otp: data.otp,
        newPassword: data.password,
      }).unwrap();
      toast.success("Password changed successfully");
      reset();
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form
        onSubmit={handleSubmit(
          isOtpSent ? handlePasswordSubmit : handleOtpRequest,
        )}
        className="p-6 bg-white rounded-lg shadow-md"
      >
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          {isOtpSent ? "Reset Your Password" : "Request OTP"}
        </Dialog.Title>
        <div className="mt-2 flex flex-col gap-6">
          {!isOtpSent && (
            <Textbox
              placeholder="Enter Email"
              type="email"
              name="email"
              label="Email"
              className="w-full rounded"
              register={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email ? errors.email.message : ""}
            />
          )}
          {isOtpSent && (
            <>
              <Textbox
                placeholder="Enter OTP"
                type="text"
                name="otp"
                label="OTP"
                className="w-full rounded"
                register={register("otp", {
                  required: "OTP is required",
                })}
                error={errors.otp ? errors.otp.message : ""}
              />
              <Textbox
                placeholder="New Password"
                type="password"
                name="password"
                label="New Password"
                className="w-full rounded"
                register={register("password", {
                  required: "New Password is required",
                })}
                error={errors.password ? errors.password.message : ""}
              />
              <Textbox
                placeholder="Confirm Password"
                type="password"
                name="cpass"
                label="Confirm Password"
                className="w-full rounded"
                register={register("cpass", {
                  required: "Confirm Password is required",
                })}
                error={errors.cpass ? errors.cpass.message : ""}
              />
            </>
          )}
        </div>
        {isOtpRequestLoading || isPasswordLoading ? (
          <div className="py-5">
            <Loading />
          </div>
        ) : (
          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse gap-4">
            <Button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              label={isOtpSent ? "Reset Password" : "Request OTP"}
            />
            <Button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default ChangePassword;
