export default {
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  },
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'], configFile: false }],
  },
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/client/src/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/client/src/__mocks__/fileMock.js',
  },
  testMatch: [
    '**/game/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.jsx',
  ],
  testEnvironment: 'jsdom',
};
