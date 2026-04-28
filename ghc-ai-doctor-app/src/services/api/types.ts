export interface SessionResponse {
  authenticated: boolean;
  sessionId: string; // From response.data.sessionId (OpenMRS REST API response body)
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
