module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/app', '<rootDir>/test', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',

    // use minified versions of d3 modules
    'd3-format': '<rootDir>/node_modules/d3-format/dist/d3-format.js',

    // Mock import of Viz
    '@tidepool/viz': '<rootDir>/__mocks__/@tidepool/viz.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    '!app/**/*.test.{js,jsx}',
    '!app/*/index.js',
  ],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
