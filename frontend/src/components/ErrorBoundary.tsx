import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h1>

          <p className="text-foreground/60 mb-6">
            An unexpected error occurred. Please try again or return to the home page.
          </p>

          {this.state.error?.message && (
            <div className="mb-6 text-left">
              <pre className="bg-background border border-border rounded-lg p-4 text-sm text-danger overflow-x-auto whitespace-pre-wrap break-words">
                <code>{this.state.error.message}</code>
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Try Again
            </button>

            <a
              href="/"
              className="px-6 py-2.5 bg-surface border border-border text-foreground font-medium rounded-lg hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
