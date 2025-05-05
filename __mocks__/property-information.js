/* global jest */

// Mock for property-information
const propertyInformation = {
  find: jest.fn(() => ({
    boolean: false,
  })),
};

module.exports = propertyInformation;
