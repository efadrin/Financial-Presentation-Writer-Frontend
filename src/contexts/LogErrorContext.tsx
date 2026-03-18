import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLogError } from '@/hooks/useLogError';
import { UserInfoLog } from '@/interfaces/LoggerInfo';

const LogErrorContext = createContext<(action: string, error: Error) => Promise<void>>(async () => {});

export const LogErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = useSelector((state: RootState) => state.settings);
  const userInfo: UserInfoLog = {
    UserEmail: settings.userInfo?.Email || '',
    Organization: settings.userInfo?.FirmID || '',
  };
  const logError = useLogError(userInfo);
  return (
    <LogErrorContext.Provider value={logError}>{children}</LogErrorContext.Provider>
  );
};

export const useLogErrorContext = () => useContext(LogErrorContext);
