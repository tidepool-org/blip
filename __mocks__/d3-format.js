/* global jest */

// Mock for d3-format
module.exports = {
  format: jest.fn((specifier) => (value) => `${value}`),
  formatPrefix: jest.fn(),
  formatDefaultLocale: jest.fn(),
};
