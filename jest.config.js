module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/app', '<rootDir>/test', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',

    // use minified versions of d3 modules (prevents errors due to Jest not liking ESM)
    'd3-array': '<rootDir>/node_modules/d3-array/dist/d3-array.min.js',
    'd3-format': '<rootDir>/node_modules/d3-format/dist/d3-format.min.js',
    'd3-scale': '<rootDir>/node_modules/d3-scale/dist/d3-scale.min.js',
    'd3-shape': '<rootDir>/node_modules/d3-shape/dist/d3-shape.min.js',
    'd3-time': '<rootDir>/node_modules/d3-time/dist/d3-time.min.js',
    'd3-interpolate': '<rootDir>/node_modules/d3-interpolate/dist/d3-interpolate.min.js',
    'd3-color': '<rootDir>/node_modules/d3-color/dist/d3-color.min.js',
    'd3-path': '<rootDir>/node_modules/d3-path/dist/d3-path.min.js',
    'd3-ease': '<rootDir>/node_modules/d3-ease/dist/d3-ease.min.js',
    'd3-timer': '<rootDir>/node_modules/d3-timer/dist/d3-timer.min.js',
    'd3-voronoi': '<rootDir>/node_modules/d3-voronoi/dist/d3-voronoi.min.js',
    'd3-time-format': '<rootDir>/node_modules/d3-time-format/dist/d3-time-format.min.js',

    // Mock problematic ES modules
    'property-information': '<rootDir>/__mocks__/property-information.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // This pattern ensures that Babel processes @tidepool/viz and all its dependencies.
    // In the event that a `Jest failed to parse a file` error is encountered and it is
    // a node_module, the module name can be added here to be processed by Babel.

    'node_modules/(?!(.*\\.mjs$|@tidepool/viz|internmap|react-markdown|vfile|unist-util-stringify-position|unified|bail|is-plain-obj|trough|remark-parse|mdast-util-from-markdown|mdast-util-to-string|mdast-util-to-hast|micromark|decode-named-character-reference|remark-rehype|unist-util-position|trim-lines|unist-util-visit|unist-util-is|unist-util-generated|mdast-util-definitions|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens))',
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
