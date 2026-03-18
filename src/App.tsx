import React, { lazy, Suspense } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import Welcome from '@components/Welcome';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import SessionManager from '@components/SessionManager';
import { LogErrorProvider } from '@/contexts/LogErrorContext';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundary';

import '@public/main.css';
import '@utils/i18n';
import { AuthStatusConst } from './utils/constants';
import UIOverlayProvider from './contexts/UIOverlayContext';
import FailedLoginFallback from './components/common/FailedLoginFallback';
import LoadingFallback from './components/common/LoadingFallback';

const Routing = lazy(() => import('./Routing'));

const App: React.FC = () => {
  const appStatus = useSelector((state: RootState) => state.auth.status);

  return (
    <FluentProvider theme={webLightTheme} style={{ height: '100%' }}>
      <LogErrorProvider>
        <ErrorBoundaryWithContext>
          <UIOverlayProvider>
            <SessionManager fallback={<FailedLoginFallback />}>
              <div className='app-container'>
                {appStatus === AuthStatusConst.initial && <Welcome />}
                {appStatus === AuthStatusConst.loggedIn && (
                  <Suspense fallback={<LoadingFallback />}>
                    <Routing />
                  </Suspense>
                )}
                {appStatus === AuthStatusConst.failed && (
                  <p>Failed to authenticate. Please try again.</p>
                )}
              </div>
            </SessionManager>
          </UIOverlayProvider>
        </ErrorBoundaryWithContext>
      </LogErrorProvider>
    </FluentProvider>
  );
};

export default App;
