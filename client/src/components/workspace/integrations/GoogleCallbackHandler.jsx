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
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleCallback } from '../../../slices/googleIntegrationSlice';
import { toast } from 'sonner';

const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication cancelled or failed');
        setProcessing(false);
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      if (!code || !state) {
        toast.error('Invalid callback parameters');
        setProcessing(false);
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      try {
        await dispatch(handleCallback({ code, state })).unwrap();
        toast.success('Google account connected successfully!');
        setProcessing(false);
        
        // Close popup if opened in popup, otherwise navigate
        if (window.opener) {
          window.opener.postMessage({ type: 'google-auth-success' }, '*');
          window.close();
        } else {
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } catch (err) {
        toast.error('Failed to connect Google account');
        setProcessing(false);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    processCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Google Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we set up your integration...
            </p>
          </>
        ) : (
          <>
            <svg
              className="mx-auto h-16 w-16 text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you back...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackHandler;
