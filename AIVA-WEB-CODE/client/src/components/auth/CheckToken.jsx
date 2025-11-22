/*=================================================================
 * Project: AIVA-WEB
 * File: OtpInput.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * OTP input component for handling verification codes during
 * user authentication and registration.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useEffect } from "react";

const CheckToken = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    //console.log('Retrieved Token:', token);
  }, []);

  return <div>Check the console for the token.</div>;
};

export default CheckToken;
