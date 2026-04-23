export interface SessionResponse {
  sessionId: string;
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
  };
}
