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
import React from "react";
import ErrorAlert from "./ErrorAlert";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      error,
      errorInfo,
    });

    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      //console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4">
          <ErrorAlert
            message={
              this.props.fallback ||
              "Something went wrong. Please try again later."
            }
          />
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-4">
              <details className="cursor-pointer">
                <summary className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </pre>
              </details>
            </div>
          )}
          {this.props.children && (
            <button
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.displayName = "ErrorBoundary";
export { ErrorBoundary };
export default ErrorBoundary;
