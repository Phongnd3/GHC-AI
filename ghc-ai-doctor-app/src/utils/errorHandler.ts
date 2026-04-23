// src/utils/errorHandler.ts
// Stub implementation for Story 1.3 testing infrastructure
// Full implementation in Story 1.6

export function mapErrorToUserMessage(error: any): string {
  if (!error.response) {
    return 'No internet connection. Please check your WiFi.';
  }

  const status = error.response.status;

  switch (status) {
    case 401:
      return 'Session expired. Please log in again.';
    case 408:
      return 'Request timed out. Please try again.';
    case 500:
    case 503:
      return 'Server unavailable. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
