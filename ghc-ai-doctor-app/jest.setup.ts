// jest.setup.ts
// Note: @testing-library/jest-native is deprecated and matchers are now built into
// @testing-library/react-native v12.4+. No need to import extend-expect separately.

// Mock expo-router — prevents "Cannot find native module 'ExpoRouter'" errors
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: 'http://localhost:8080/openmrs/ws/rest/v1',
        sessionTimeout: 1800000,
        cacheDuration: 300000,
        requestTimeout: 10000,
        appEnv: 'development',
      },
    },
  },
}));

// Additional mocks will be added as packages are installed in future stories:
// - expo-secure-store (Story 2.1)
// - @expo/vector-icons (Story 1.7)
