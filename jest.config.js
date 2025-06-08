export default {
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  },
  transform: {},
  testMatch: [
    '**/game/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.jsx',
  ],
  testEnvironment: 'jsdom',
};
