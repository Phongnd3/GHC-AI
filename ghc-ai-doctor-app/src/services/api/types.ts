export interface SessionResponse {
  authenticated: boolean;
  sessionId: string | null; // Extracted when exposed; native cookie jar may hold it otherwise
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
  currentProvider: { uuid: string; display: string } | null;
}
