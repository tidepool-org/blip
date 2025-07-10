import mapValues from 'lodash/mapValues';

/* global jest */

const mockLocalStorage = (initialStore = {}) => {
  let mockStore = mapValues(initialStore, val => JSON.stringify(val));

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key) => mockStore[key] || null),
      setItem: jest.fn((key, value) => {
        mockStore[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockStore[key];
      }),
      clear: jest.fn(() => {
        mockStore = {};
      }),
    },
    writable: true,
  });
};

export default mockLocalStorage;
