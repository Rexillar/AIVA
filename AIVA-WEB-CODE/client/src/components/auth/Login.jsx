/*=================================================================
 * Project: AIVA-WEB
 * File: Login.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Login component for handling user authentication.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useState } from "react";
import { useLoginMutation } from "../../redux/slices/api/authApiSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// ... rest of the existing Login.jsx code ...
