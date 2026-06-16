'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafeRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SafeRenderState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary that catches render errors in child components
 * without crashing the entire app. Used to isolate plugin-related errors.
 */
export class SafeRender extends React.Component<SafeRenderProps, SafeRenderState> {
  constructor(props: SafeRenderProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SafeRenderState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SafeRender] Caught error:', error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.handleRetry} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}