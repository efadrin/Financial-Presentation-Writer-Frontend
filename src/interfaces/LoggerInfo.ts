// Interfaces for user and logger info used in logging user activity/errors

export interface LoggerInfo {
  UserEmail: string;
  Logr: number;
  LogDetail: string;
  Action: string;
  Endpoint: string;
  Method: string;
  IPAddress?: string;
  StatusCode?: number;
  Activity?: string;
  ErrorInfo?: string;
}

export interface UserInfoLog {
  UserName?: string;
  UserEmail: string;
  MfstTnatID?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  UserConfig?: Record<string, unknown>;
  Organization?: string;
}
