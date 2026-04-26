export interface SessionResponse {
  authenticated: boolean;
  sessionId: string; // Extracted from JSESSIONID Set-Cookie header
  user: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    person: {
      uuid: string;
      display: string;
    };
  };
}
