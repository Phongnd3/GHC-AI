// src/utils/__tests__/errorHandler.test.ts
import { mapErrorToUserMessage } from '@/utils/errorHandler';

describe('mapErrorToUserMessage', () => {
  it('returns network error message when no response', () => {
    const error = { response: undefined } as any;
    expect(mapErrorToUserMessage(error)).toBe(
      'No internet connection. Please check your WiFi.'
    );
  });

  it('returns session expired message for 401', () => {
    const error = { response: { status: 401 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Session expired. Please log in again.');
  });

  it('returns server unavailable message for 500', () => {
    const error = { response: { status: 500 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Server unavailable. Please try again.');
  });

  it('returns server unavailable message for 503', () => {
    const error = { response: { status: 503 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Server unavailable. Please try again.');
  });

  it('returns timeout message for 408', () => {
    const error = { response: { status: 408 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Request timed out. Please try again.');
  });

  it('returns generic message for unknown status', () => {
    const error = { response: { status: 422 } } as any;
    expect(mapErrorToUserMessage(error)).toBe('Something went wrong. Please try again.');
  });
});
