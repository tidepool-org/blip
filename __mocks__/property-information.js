/* global jest */

// Mock for property-information
const propertyInformation = {
  find: jest.fn(() => ({
    property: 'mocked-property',
    attribute: 'mocked-attribute',
    boolean: false,
    overloadedBoolean: false,
    number: false,
    spaceSeparated: false,
    commaSeparated: false,
    commaOrSpaceSeparated: false,
    mustUseProperty: false,
    defined: true
  })),
  normalize: jest.fn(value => value.toLowerCase()),
  html: {},
  svg: {},
  find: jest.fn(),
  normal: {},
  schema: {}
};

module.exports = propertyInformation;
