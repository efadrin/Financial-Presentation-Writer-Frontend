export interface ApiResponse<T> {
  Data: T;
  Errors: string;
  Message: string;
  StatusCode: number;
  Succeeded: boolean;
}

export interface ErrorResponse {
  code: number;
  message: string;
}
