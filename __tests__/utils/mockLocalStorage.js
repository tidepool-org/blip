/* global jest */

const mockLocalStorage = (mockStore = {}) => {
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
