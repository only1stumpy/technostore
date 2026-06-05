export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: Record<string, string[]>;
}
