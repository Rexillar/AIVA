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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide frontend utility functions

   ⟁  WHY          : Code reusability and consistent behavior

   ⟁  WHAT         : Helper functions for frontend operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : LOW
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Utilities provided. Code simplified. Development efficient."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { initializeApp } from "firebase/app";
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
