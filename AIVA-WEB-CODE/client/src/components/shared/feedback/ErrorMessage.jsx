import React from "react";

export const ErrorMessage = ({ message, details }) => {
  return (
    <div className="text-center text-red-500 p-4 rounded-lg bg-red-50 border border-red-200">
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      {details && (
        <p className="text-sm text-red-400 whitespace-pre-wrap">
          {typeof details === "object"
            ? JSON.stringify(details, null, 2)
            : details}
        </p>
      )}
    </div>
  );
};
