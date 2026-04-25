/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',

  // Setup file runs after the test framework is installed
  setupFilesAfterEnv: ['./jest.setup.ts'],

  // Module alias resolution — mirrors tsconfig.json paths
  moduleNameMapper: {
    '^@/components$': '<rootDir>/src/components',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/theme$': '<rootDir>/src/theme',
    '^@/theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
  },

  // Allow Expo and React Native packages to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**', // Exclude route files (integration tested separately)
    '!src/**/__tests__/**', // Exclude test files themselves
    '!src/**/__mocks__/**',
  ],

  coverageThreshold: {
    // Overall project floor
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // API layer: 90% target (ARCH-REQ-8)
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // UI components: 80% target (ARCH-REQ-8)
    './src/components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Utils (includes errorHandler — critical path): 100%
    './src/utils/errorHandler.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',

  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
};
