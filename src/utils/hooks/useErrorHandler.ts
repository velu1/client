import { useCallback } from "react";

interface ErrorDetails {
  message: string;
  code?: string | number;
  context?: string;
  stack?: string;
}

export const useErrorHandler = () => {
  const logError = useCallback(
    (error: Error | ErrorDetails, context?: string) => {
      const errorInfo = {
        message: error instanceof Error ? error.message : error.message,
        stack: error instanceof Error ? error.stack : error.stack,
        context: context || error instanceof Error ? undefined : error.context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("🚨 Error captured:", errorInfo);
      }

      // Here you can send errors to your monitoring service
      // Example: sendToMonitoringService(errorInfo);
    },
    []
  );

  const handleAsyncError = useCallback(
    <T>(
      asyncFn: () => Promise<T>,
      errorContext?: string,
      onError?: (error: Error) => void
    ) => {
      return async (): Promise<T | undefined> => {
        try {
          return await asyncFn();
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logError(err, errorContext);
          onError?.(err);
          return undefined;
        }
      };
    },
    [logError]
  );

  const handleSyncError = useCallback(
    <T>(
      syncFn: () => T,
      errorContext?: string,
      onError?: (error: Error) => void
    ) => {
      return (): T | undefined => {
        try {
          return syncFn();
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logError(err, errorContext);
          onError?.(err);
          return undefined;
        }
      };
    },
    [logError]
  );

  return {
    logError,
    handleAsyncError,
    handleSyncError,
  };
};

export default useErrorHandler;
