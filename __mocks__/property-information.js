/* global jest */

// Mock for property-information
const propertyInformation = {
  find: jest.fn(() => ({
    property: 'property-mock',
    attribute: 'attribute-mock',
    boolean: false,
    overloadedBoolean: false,
    number: false,
    spaceSeparated: false,
    commaSeparated: false,
    commaOrSpaceSeparated: false,
    mustUseProperty: false,
    defined: true,
  })),
  normalize: jest.fn(),
  html: {},
  svg: {},
  normal: {},
  schema: {},
};

module.exports = propertyInformation;
