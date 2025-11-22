/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAMXyjumL31wjyxarcm-aa7TinNRUahLJM",
  authDomain: "aiva-dash.firebaseapp.com",
  projectId: "aiva-dash",
  storageBucket: "aiva-dash.appspot.com",
  messagingSenderId: "231407350318",
  appId: "1:231407350318:web:f0623ec2424b3d0661e5bf",
  measurementId: "G-V879S6ZF5C",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export default app;
