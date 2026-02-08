import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[40vh] flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-dark-card border border-white/5 p-8 rounded-3xl shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-500">
                <AlertCircle size={32} />
              </div>
            </div>
            <h2 className="text-xl font-black uppercase text-white mb-2 tracking-tighter">
              Something went wrong
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary/80 transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
