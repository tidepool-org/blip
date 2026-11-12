/* global expect, describe, it, beforeAll, beforeEach, afterAll, afterEach */

import React from 'react';
import PropTypes from 'prop-types';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import { RETRY_COUNT } from '@app/redux/api/baseApi';
import { useGetLatestDatumTimeByUploadQuery } from '@app/redux/features/latestDatum/latestDatumApi';

const DATA_URL = 'http://app.tidepool.test/data/:userId';

const Probe = ({ uploadId }) => {
  const { currentData, isFetching, isError } = useGetLatestDatumTimeByUploadQuery(
    { patientId: 'patient123', uploadId },
    { skip: !uploadId },
  );

  if (isFetching) return <p>LOADING</p>;
  if (isError) return <p>ERROR</p>;
  if (currentData === undefined) return <p>NO DATA</p>;

  return <p>TIME: {String(currentData)}</p>;
};

Probe.propTypes = {
  uploadId: PropTypes.string,
};

const server = setupServer();

const renderProbe = (store, uploadId) => render(
  <Provider store={store}>
    <Probe uploadId={uploadId} />
  </Provider>
);

describe('latestDatumApi getLatestDatumTimeByUpload', () => {
  let store;

  beforeAll(() => server.listen());

  beforeEach(() => {
    store = setupStore();
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('requests the patient\'s data route with the upload id, the latest-datum type list and latest=1', async () => {
    let requested;
    server.use(
      http.get(DATA_URL, ({ request, params }) => {
        requested = { userId: params.userId, searchParams: new URL(request.url).searchParams };
        return HttpResponse.json([]);
      })
    );

    renderProbe(store, 'upload123');

    await waitFor(() => {
      expect(requested).toBeDefined();
    });

    expect(requested.userId).toBe('patient123');
    expect(requested.searchParams.get('uploadId')).toBe('upload123');
    expect(requested.searchParams.get('type')).toBe('cbg,smbg,basal,bolus,insulin,wizard,food,pumpSettings,upload');
    expect(requested.searchParams.get('latest')).toBe('1');
  });

  it('returns the newest datum\'s time in Unix ms when the datums are out of order', async () => {
    server.use(
      http.get(DATA_URL, () => HttpResponse.json([
        { type: 'cbg', time: '2023-03-10T12:00:00.000Z' },
        { type: 'basal', time: '2023-03-20T08:30:00.000Z' },
        { type: 'upload', time: '2023-03-01T00:00:00.000Z' },
      ]))
    );

    renderProbe(store, 'upload123');

    await waitFor(() => {
      expect(screen.getByText(`TIME: ${Date.parse('2023-03-20T08:30:00.000Z')}`)).toBeInTheDocument();
    });
  });

  it('returns null when the upload has no datums', async () => {
    server.use(
      http.get(DATA_URL, () => HttpResponse.json([]))
    );

    renderProbe(store, 'upload123');

    await waitFor(() => {
      expect(screen.getByText('TIME: null')).toBeInTheDocument();
    });
  });

  it('returns null without retrying when the data route responds 404', async () => {
    let requestCount = 0;
    server.use(
      http.get(DATA_URL, () => {
        requestCount++;
        return new HttpResponse('Not found', { status: 404 });
      })
    );

    renderProbe(store, 'upload123');

    await waitFor(() => {
      expect(screen.getByText('TIME: null')).toBeInTheDocument();
    });

    expect(requestCount).toBe(1);
  });

  it('reports an error when the request fails', async () => {
    let requestCount = 0;
    server.use(
      http.get(DATA_URL, () => {
        requestCount++;
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderProbe(store, 'upload123');

    // The shared retry wrapper backs off between attempts before giving up
    await waitFor(() => {
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(requestCount).toBe(RETRY_COUNT + 1);
  });

  it('sends no request while skipped', async () => {
    let requested = false;
    server.use(
      http.get(DATA_URL, () => {
        requested = true;
        return HttpResponse.json([]);
      })
    );

    renderProbe(store, undefined);

    expect(screen.getByText('NO DATA')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(requested).toBe(false);
  });
});
