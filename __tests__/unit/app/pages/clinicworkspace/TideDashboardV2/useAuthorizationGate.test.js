import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import { thunk } from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

import useAuthorizationGate from '@app/pages/clinicworkspace/TideDashboardV2/useAuthorizationGate';

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
  useLDClient: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('useAuthorizationGate', () => {
  let store;

  const stateWithEntitlement = (tideDashboard) => ({
    blip: {
      selectedClinicId: 'clinic123',
      clinics: {
        clinic123: { id: 'clinic123', entitlements: { tideDashboard } },
      },
    },
  });

  const loadedLDContext = { clinic: { tier: 'tier0300' } };
  const fetchingLDContext = {};

  const renderGateHook = () => renderHook(
    () => useAuthorizationGate(),
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }
  ).result.current;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports neither authorized nor unauthorized while LD is still fetching the clinic context', () => {
    // The flag value can't be trusted until LD has evaluated against the clinic context
    useFlags.mockReturnValue({ showTideDashboard: true });
    useLDClient.mockReturnValue({ getContext: () => fetchingLDContext });
    store = mockStore(stateWithEntitlement(false));

    expect(renderGateHook()).toStrictEqual({
      isAuthorized: false,
      isUnauthorized: false,
    });
  });

  it('authorizes via the showTideDashboard flag once the LD clinic context has loaded', () => {
    useFlags.mockReturnValue({ showTideDashboard: true });
    useLDClient.mockReturnValue({ getContext: () => loadedLDContext });
    store = mockStore(stateWithEntitlement(false));

    expect(renderGateHook()).toStrictEqual({
      isAuthorized: true,
      isUnauthorized: false,
    });
  });

  it('authorizes via the clinic tideDashboard entitlement when the flag is off', () => {
    useFlags.mockReturnValue({ showTideDashboard: false });
    useLDClient.mockReturnValue({ getContext: () => loadedLDContext });
    store = mockStore(stateWithEntitlement(true));

    expect(renderGateHook()).toStrictEqual({
      isAuthorized: true,
      isUnauthorized: false,
    });
  });

  it('reports unauthorized when both the entitlement and the flag deny access', () => {
    useFlags.mockReturnValue({ showTideDashboard: false });
    useLDClient.mockReturnValue({ getContext: () => loadedLDContext });
    store = mockStore(stateWithEntitlement(false));

    expect(renderGateHook()).toStrictEqual({
      isAuthorized: false,
      isUnauthorized: true,
    });
  });
});
