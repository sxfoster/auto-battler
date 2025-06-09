export default {
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 0, functions: 0, lines: 0, statements: 0 },
  },
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: false }], '@babel/preset-react'], configFile: false }],
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: false }], '@babel/preset-typescript', '@babel/preset-react'], configFile: false }],
  },
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/client/src/__mocks__/styleMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/client/src/__mocks__/fileMock.js',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  testMatch: [
    '**/game/src/**/__tests__/**/*.test.js',
    '**/game/src/**/__tests__/**/*.test.ts',
    '**/client/src/**/__tests__/**/*.test.js',
    '**/client/src/**/__tests__/**/*.test.jsx',
    '**/client/src/**/__tests__/**/*.test.tsx',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
};
