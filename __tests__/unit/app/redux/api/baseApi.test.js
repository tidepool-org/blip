/* global jest, test, expect, describe, it, beforeAll, beforeEach, afterAll, afterEach, Promise */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

import { RTKQueryApi } from '@app/redux/api/baseApi';
import { setupStore } from '@tests/utils/setupStore';

const TestApi = RTKQueryApi.injectEndpoints({
  endpoints: (build) => ({
    testPatients: build.query({
      query: () => '/settings',
    }),
  }),
});

const TestComponent = () => {
  const { data, isFetching } = TestApi.useTestPatientsQuery();

  if (isFetching) return <p>LOADING</p>;

  if (!data) return <p>NO DATA</p>;

  return <p>USERNAME: {data.username}</p>;
};

const server = setupServer();

describe('RTKQueryApi', () => {
  let store;

  beforeAll(() => server.listen());

  beforeEach(() => {
    store = setupStore();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());
  it('A GET request successfully fetches data', async () => {
    server.use(
      http.get('http://app.tidepool.test/v1/settings', async () => {
        await delay(100);
        return HttpResponse.json({ username: 'canelo', name: 'Saul Alvarez' });
      })
    );

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    // Should see loading state on initialization
    expect(screen.getByText('LOADING')).toBeInTheDocument();
    expect(screen.queryByText('USERNAME: canelo')).not.toBeInTheDocument();

    // Should see data on fetch success
    await waitFor(() => {
      expect(screen.getByText('USERNAME: canelo')).toBeInTheDocument();
    });

    expect(screen.queryByText('LOADING')).not.toBeInTheDocument();
  });
});
