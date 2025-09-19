"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

interface TurnstileWrapperProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
}

export default function TurnstileWrapper({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleVerify = (token: string) => {
    setIsLoading(false);
    setHasError(false);
    onVerify(token);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleExpire = () => {
    setIsLoading(false);
    onExpire?.();
  };

  if (!siteKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
        <p>⚠️ Turnstile site key not configured. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <div className={`turnstile-wrapper ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading security check...</span>
        </div>
      )}
      
      {hasError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <p>❌ Security check failed. Please refresh the page and try again.</p>
        </div>
      )}

      <Turnstile
        siteKey={siteKey}
        onSuccess={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme,
          size,
        }}
        style={{
          display: isLoading || hasError ? "none" : "block",
        }}
      />
    </div>
  );
}