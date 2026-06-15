'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const user = useAuthStore.getState().user;
      const locale = (user?.language as Locale) ?? 'en';

      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="neu-card flex flex-col items-center gap-5 p-8 max-w-md mx-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 neu-flat">
              <AlertTriangle className="size-7 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">{t('error.somethingWentWrong', locale)}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('error.unexpectedError', locale)}
              </p>
              {this.state.error && (
                <div className="neu-pressed mt-2 max-h-24 overflow-auto">
                  <p className="text-xs text-muted-foreground font-mono px-3 py-2">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
            <Button onClick={this.handleRetry} className="btn-neu gap-2">
              <RotateCcw className="size-4" />
              {t('error.retry', locale)}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}