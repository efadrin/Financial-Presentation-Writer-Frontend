import { store } from '@/store';
import { apiSlice } from '@/services/apiSlice';
import { LoggerInfo } from '@/interfaces/LoggerInfo';
import {
  serializeErrorWithStack,
  serializeErrorWithStackOnlyMessage,
} from '@/utils/errorUtils';

declare global {
  interface Window {
    logGlobalError: (action: string, error: string | Error) => void;
  }
}

const CHUNK_ERROR_RELOAD_KEY = 'chunk_error_reload_timestamp';
const RELOAD_COOLDOWN_MS = 10000;

function isChunkLoadError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message;
  const name = typeof error === 'string' ? '' : error.name;
  return (
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Failed to fetch dynamically imported module') ||
    name === 'ChunkLoadError'
  );
}

function shouldAutoReload(): boolean {
  const lastReload = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
  if (!lastReload) return true;
  const timeSinceLastReload = Date.now() - parseInt(lastReload, 10);
  return timeSinceLastReload > RELOAD_COOLDOWN_MS;
}

function autoReloadForChunkError(): void {
  sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, Date.now().toString());
  window.location.reload();
}

(function attachGlobalLogger() {
  function logGlobalError(action: string, error: string | Error) {
    try {
      const state = store.getState();
      const settings = state.settings;
      const errorObj = typeof error === 'string' ? new Error(error) : error;

      const loggerInfo: LoggerInfo = {
        UserEmail: settings.userInfo?.Email,
        Action: action,
        Endpoint: '',
        Method: 'POST',
        Activity: serializeErrorWithStackOnlyMessage(errorObj),
        StatusCode: 500,
        Logr: 1,
        LogDetail: serializeErrorWithStack(errorObj),
      };

      try {
        store.dispatch(apiSlice.endpoints.logUserActivity.initiate(loggerInfo));
      } catch (loggingError) {
        console.warn('Failed to log global error to server:', loggingError);
      }
    } catch (err) {
      console.warn('Error in global error logger:', err);
    }
  }

  window.logGlobalError = logGlobalError;

  window.addEventListener('unhandledrejection', (event) => {
    try {
      logGlobalError('unhandledrejection', event.reason);
      if (event.reason && isChunkLoadError(event.reason) && shouldAutoReload()) {
        autoReloadForChunkError();
      }
    } catch (err) {
      console.warn('Error handling unhandledrejection:', err);
    }
  });

  window.addEventListener('error', (event) => {
    try {
      const error = event.error || event.message;
      logGlobalError('window.error', error);
      if (error && isChunkLoadError(error) && shouldAutoReload()) {
        autoReloadForChunkError();
      }
    } catch (err) {
      console.warn('Error handling window.error:', err);
    }
  });
})();
