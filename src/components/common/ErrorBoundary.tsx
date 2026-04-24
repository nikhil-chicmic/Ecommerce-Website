import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { logger } from '../../utils';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="error-fallback-container" role="alert">
      <div className="error-card">
        <h2>Something went wrong</h2>
        <p className="error-message">{error instanceof Error ? error.message : String(error)}</p>
        <button onClick={resetErrorBoundary} className="btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
};

export const GlobalErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logger.error('Caught by GlobalErrorBoundary:', { error, info });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
