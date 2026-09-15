/* global jest, expect, describe, it, beforeAll, beforeEach, afterAll, afterEach */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import { updateKeycloakConfig } from '@app/keycloak';
import { useGetMfaStatusQuery } from '@app/redux/features/mfaStatus/mfaStatusApi';

const CREDENTIALS_URL = 'http://app.tidepool.test/realms/blip/account/credentials';

jest.mock('keycloak-js', () => ({
  __esModule: true,
  default: function KeycloakMock() {
    return {
      authServerUrl: 'http://app.tidepool.test',
      realm: 'blip',
      token: 'tokenValue',
    };
  },
}));

const otpCredentials = [
  { type: 'password', category: 'basic-authentication' },
  {
    type: 'otp',
    category: 'two-factor',
    userCredentialMetadatas: [{
      credential: { id: 'otp-1', type: 'otp', userLabel: 'OnePlus 12R', createdDate: 1779895908703 },
    }],
  },
  {
    type: 'recovery-authn-codes',
    category: 'two-factor',
    userCredentialMetadatas: [{
      credential: {
        id: 'rec-1',
        type: 'recovery-authn-codes',
        createdDate: 1779895908756,
        credentialData: '{"algorithm":"SHA-512","totalCodes":12,"remainingCodes":10}',
      },
    }],
  },
];

const Probe = () => {
  const { data, isFetching, isError } = useGetMfaStatusQuery();

  if (isFetching) return <p>LOADING</p>;
  if (isError) return <p>ERROR</p>;
  if (!data) return <p>NO DATA</p>;

  return (
    <div>
      <p>ENABLED: {String(data.enabled)}</p>
      <p>DEVICE: {data.device.name}</p>
      <p>RECOVERY USED: {data.recoveryCodes.used}</p>
    </div>
  );
};

const server = setupServer();

describe('mfaStatusApi getMfaStatus', () => {
  let store;

  beforeAll(() => server.listen());

  beforeEach(() => {
    // Initialize the module-level keycloak instance (keycloak-js is mocked) so
    // fetchKeycloakCredentials can build its URL and bearer token.
    updateKeycloakConfig({ url: 'http://app.tidepool.test', realm: 'blip' }, {});
    store = setupStore();
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('maps the Keycloak credentials response to the page-ready mfaStatus shape', async () => {
    server.use(
      http.get(CREDENTIALS_URL, async () => {
        await delay(50);
        return HttpResponse.json(otpCredentials);
      })
    );

    render(
      <Provider store={store}>
        <Probe />
      </Provider>
    );

    expect(screen.getByText('LOADING')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ENABLED: true')).toBeInTheDocument();
    });

    expect(screen.getByText('DEVICE: OnePlus 12R')).toBeInTheDocument();
    expect(screen.getByText('RECOVERY USED: 2')).toBeInTheDocument();
  });

  it('surfaces isError on a non-OK Keycloak response', async () => {
    server.use(
      http.get(CREDENTIALS_URL, () => new HttpResponse(null, { status: 403 }))
    );

    render(
      <Provider store={store}>
        <Probe />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
  });

  it('requests the Keycloak account/credentials endpoint', async () => {
    let requested = false;
    server.use(
      http.get(CREDENTIALS_URL, () => {
        requested = true;
        return HttpResponse.json([]);
      })
    );

    render(
      <Provider store={store}>
        <Probe />
      </Provider>
    );

    await waitFor(() => {
      expect(requested).toBe(true);
    });
  });
});
