// src/utils/errorHandler.ts

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface MappedError {
  message: string;
  type: ErrorType;
}

export function mapErrorToUserMessage(error: any): MappedError {
  // Timeout error (Axios sets code to ECONNABORTED)
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timed out. Please try again.',
      type: ErrorType.TIMEOUT_ERROR,
    };
  }

  // Network error (request made but no response received)
  if (!error.response && error.request) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      type: ErrorType.NETWORK_ERROR,
    };
  }

  // Server responded with error status
  if (error.response) {
    const status = error.response.status;

    if (status === 401) {
      return {
        message: 'Session expired. Please log in again.',
        type: ErrorType.AUTH_ERROR,
      };
    }

    if (status === 500 || status === 503) {
      return {
        message: 'Server unavailable. Please try again later.',
        type: ErrorType.SERVER_ERROR,
      };
    }
  }

  // OpenMRS returns 200 + authenticated:false for bad credentials — auth.ts
  // throws a plain Error with code AUTH_CREDENTIALS_INVALID in that case.
  if (error.code === 'AUTH_CREDENTIALS_INVALID') {
    return {
      message: 'Session expired. Please log in again.',
      type: ErrorType.AUTH_ERROR,
    };
  }

  // Fallback for unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: ErrorType.UNKNOWN_ERROR,
  };
}
