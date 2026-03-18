// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from '@utils/i18n';
import App from '@/App';
import { persistor, store } from '@/store';
import './globalErrorLogger';
import { login } from '@/services/authSlice';

import { PersistGate } from 'redux-persist/integration/react';

// Mark app as mounted to hide initial skeleton
const markAppMounted = () => {
  document.body.classList.add('app-mounted');
};

// Start login immediately when Office.js is ready - don't wait for React render
let loginStarted = false;
const startLoginEarly = () => {
  if (!loginStarted) {
    loginStarted = true;
    store.dispatch(login());
  }
};

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    // Start login IMMEDIATELY - don't wait for render
    startLoginEarly();

    const rootElement = document.getElementById('root')!;
    const root = ReactDOM.createRoot(rootElement);

    // Hide skeleton after first render
    requestAnimationFrame(markAppMounted);

    root.render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </PersistGate>
      </Provider>
    );
  }
});
