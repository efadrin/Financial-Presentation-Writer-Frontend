import { Middleware } from '@reduxjs/toolkit';
import { apiSlice } from '@/services/apiSlice';
import { LoggerInfo } from '@/interfaces/LoggerInfo';
import type { AppDispatch } from '@/store'; // adjust the import path as needed

export const errorLoggerMiddleware: Middleware =
  (store) => (next) => async (action) => {
    try {
      return await next(action);
    } catch (err) {
      try {
        const error = err as Error;
        const state = store.getState();
        const settings = state.settings;

        const loggerInfo: LoggerInfo = {
          UserEmail: settings.userInfo?.Email,
          Action: (action as { type: string }).type,
          Endpoint: '/api/',
          Method: 'POST',
          ErrorInfo: error.message,
          StatusCode: 500,
          Logr: 1,
          LogDetail: error.message,
        };

        // Use try-catch to prevent logging errors from affecting main functionality
        try {
          await (store.dispatch as AppDispatch)(
            apiSlice.endpoints.logUserActivity.initiate(loggerInfo)
          ).unwrap();
        } catch (loggingError) {
          // Log the logging error to console but don't throw
          console.warn('Failed to log error in middleware:', loggingError);
        }
      } catch (middlewareError) {
        // Catch any other errors in the middleware
        console.warn('Error in error logger middleware:', middlewareError);
      }

      throw err;
    }
  };
