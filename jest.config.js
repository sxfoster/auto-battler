export default {
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  },
  transform: {
    '^.+\\.jsx$': ['babel-jest', { presets: ['@babel/preset-react'], configFile: false }],
  },
  extensionsToTreatAsEsm: ['.jsx'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/client/src/__mocks__/fileMock.js',
  },
  testMatch: [
    '**/game/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.jsx',
  ],
  testEnvironment: 'jsdom',
};
