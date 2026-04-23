// src/utils/__tests__/errorHandler.test.ts
import { mapErrorToUserMessage, ErrorType } from '@/utils/errorHandler';

describe('mapErrorToUserMessage', () => {
  it('should map network errors correctly', () => {
    const error = { request: {}, message: 'Network Error' };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.NETWORK_ERROR);
    expect(result.message).toBe('No internet connection. Please check your network and try again.');
  });

  it('should map 401 authentication errors correctly', () => {
    const error = { response: { status: 401 } };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.AUTH_ERROR);
    expect(result.message).toBe('Session expired. Please log in again.');
  });

  it('should map 500 server errors correctly', () => {
    const error = { response: { status: 500 } };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.SERVER_ERROR);
    expect(result.message).toBe('Server unavailable. Please try again later.');
  });

  it('should map 503 server errors correctly', () => {
    const error = { response: { status: 503 } };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.SERVER_ERROR);
    expect(result.message).toBe('Server unavailable. Please try again later.');
  });

  it('should map timeout errors correctly', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.TIMEOUT_ERROR);
    expect(result.message).toBe('Request timed out. Please try again.');
  });

  it('should map unknown errors correctly', () => {
    const error = { message: 'Something unexpected happened' };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should map unknown status codes to unknown error', () => {
    const error = { response: { status: 422 } };
    const result = mapErrorToUserMessage(error);

    expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe('An unexpected error occurred. Please try again.');
  });
});
