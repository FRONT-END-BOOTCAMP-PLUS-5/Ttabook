export interface EmailCheckResponse {
  email: string;
  available: boolean;
  message: string;
}

export interface EmailCheckErrorResponse {
  error: string;
}