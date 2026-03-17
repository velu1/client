import React, { Component, ReactNode } from "react";
import { Button } from "../ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Here you could also send the error to your error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We encountered an unexpected error. Don't worry, this has been
                logged and our team will look into it. In the meantime, you can
                try refreshing the page or going back to the home page.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={this.handleRefresh}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left bg-muted/50 rounded-lg p-6 mt-6">
                  <summary className="cursor-pointer font-medium text-foreground mb-4 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Technical Details (Development Mode)
                  </summary>

                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium text-destructive mb-2">
                        Error Message:
                      </h4>
                      <code className="block bg-destructive/10 text-destructive p-3 rounded border-l-4 border-destructive">
                        {this.state.error.message}
                      </code>
                    </div>

                    {this.state.error.stack && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">
                          Stack Trace:
                        </h4>
                        <pre className="bg-muted text-muted-foreground p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-2">
                          Component Stack:
                        </h4>
                        <pre className="bg-muted text-muted-foreground p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap border">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Try to Recover
                  </Button>
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
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
