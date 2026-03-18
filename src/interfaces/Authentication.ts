export interface AuthResponse {
  status: string;
  result?: string;
  accountId?: string;
  error?: string | object;
}
export interface TokenResponse {
  access_token: string;
  claims?: string;
  error?: string;
}

export interface LoginData {
  SessionToken: string;
}

export interface LoginRequest {
  Token: string;
}

export interface LoginThunkResponse {
  SessionToken: string;
  MsAccessToken: string;
}
