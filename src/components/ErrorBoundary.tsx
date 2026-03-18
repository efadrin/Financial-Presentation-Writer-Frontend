import React from 'react';
import { useLogErrorContext } from '@/contexts/LogErrorContext';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  context?: (action: string, error: Error) => Promise<void>;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static defaultProps = {
    context: async () => {},
  };
  state: ErrorBoundaryState = { hasError: false };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async componentDidCatch(error: Error, _info: React.ErrorInfo) {
    if (this.props.context) {
      await this.props.context('ReactRenderError', error);
    }
    this.setState({ hasError: true });
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { children } = this.props;
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px' }}>Something went wrong</h2>
          <p style={{ margin: '0 0 16px', color: '#666' }}>
            An unexpected error occurred. Please reload the add-in.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return children;
  }
}

interface ErrorBoundaryWithContextProps {
  children: React.ReactNode;
}

export const ErrorBoundaryWithContext: React.FC<
  ErrorBoundaryWithContextProps
> = ({ children }) => {
  const logError = useLogErrorContext();
  return <ErrorBoundary context={logError}>{children}</ErrorBoundary>;
};
