import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

const RouteErrorPage = () => {
  const error = useRouteError();

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return `${error.status} ${error.statusText}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  };

  const getErrorDetails = () => {
    if (isRouteErrorResponse(error)) {
      return {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      };
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return { error: String(error) };
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const errorDetails = getErrorDetails();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bgcolor to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Main Error Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isNotFound ? "Page Not Found" : "Navigation Error"}
          </h1>

          {/* Error Description */}
          <p className="text-muted-foreground text-lg mb-2">
            {isNotFound
              ? "The page you're looking for doesn't exist or has been moved."
              : "We encountered an error while loading this page."}
          </p>

          <p className="text-destructive font-medium mb-8">
            {getErrorMessage()}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleRefresh}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Link to="/">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV !== "development" && (
            <details className="text-left bg-muted/50 rounded-lg p-6 mt-6">
              <summary className="cursor-pointer font-medium text-foreground mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Error Details (Development Mode)
              </summary>

              <div className="space-y-4 text-sm">
                <pre className="bg-muted text-muted-foreground p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Error ID: {Date.now().toString(36).toUpperCase()} • Time:{" "}
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorPage;
