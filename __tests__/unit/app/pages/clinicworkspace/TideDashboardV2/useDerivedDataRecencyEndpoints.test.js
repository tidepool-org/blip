import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import { thunk } from 'redux-thunk';
import configureStore from 'redux-mock-store';

import useDerivedDataRecencyEndpoints from '@app/pages/clinicworkspace/TideDashboardV2/useDerivedDataRecencyEndpoints';

const mockStore = configureStore([thunk]);

describe('useDerivedDataRecencyEndpoints', () => {
  let store;

  const renderEndpointsHook = (filters) => renderHook(
    () => useDerivedDataRecencyEndpoints(filters),
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }
  ).result.current;

  beforeEach(() => {
    // Fake only Date so "now" is pinned; the localized ceiling of now is 2025-05-30T00:00:00.000Z
    jest.useFakeTimers({
      now: new Date('2025-05-29T10:00:00Z'),
      doNotFake: [
        'hrtime', 'nextTick', 'performance', 'queueMicrotask',
        'requestAnimationFrame', 'cancelAnimationFrame',
        'requestIdleCallback', 'cancelIdleCallback',
        'setImmediate', 'clearImmediate',
        'setInterval', 'clearInterval',
        'setTimeout', 'clearTimeout',
      ],
    });

    store = mockStore({ blip: { timePrefs: { timezoneAware: false, timezoneName: null } } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('derives the window for the "Today" (1 day) option', () => {
    expect(renderEndpointsHook({ lastData: 1 })).toStrictEqual([
      '2025-05-29T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });

  it('derives the window for the "Within 2 days" option', () => {
    expect(renderEndpointsHook({ lastData: 2 })).toStrictEqual([
      '2025-05-28T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });

  it('derives the window for the "Within 7 days" option', () => {
    expect(renderEndpointsHook({ lastData: 7 })).toStrictEqual([
      '2025-05-23T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });

  it('derives the window for the "Within 14 days" option', () => {
    expect(renderEndpointsHook({ lastData: 14 })).toStrictEqual([
      '2025-05-16T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });

  it('derives the window for the "Within 30 days" option', () => {
    expect(renderEndpointsHook({ lastData: 30 })).toStrictEqual([
      '2025-04-30T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });

  it('defaults to the 7-day tide dashboard window when called without filters', () => {
    expect(renderEndpointsHook()).toStrictEqual([
      '2025-05-23T00:00:00.000Z', // lastDataFrom
      '2025-05-30T00:00:00.000Z', // lastDataTo
    ]);
  });
});
