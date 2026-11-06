/* global expect, describe, it, beforeAll, beforeEach, afterAll, afterEach */

import React from 'react';
import PropTypes from 'prop-types';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import { useGetProductInfoQuery } from '@app/redux/features/productInfo/productInfoApi';

const UDI_URL = 'http://app.tidepool.test/v1/udi';

const UDI_RESPONSE = {
  productName: 'Tidepool Data Platform',
  manufacturerName: 'Tidepool Project',
  manufacturerAddress: '555 Bryant St., #429, Palo Alto, CA 94301',
  releaseDate: '2026-11-03',
  releaseIdentifier: '868bd7b',
  softwareVersion: '1.103.2-868bd7b',
  deviceIdentifier: '00884400418012',
  udi: '(01)00884400418012(11)261103(8012)1.103.2-868bd7b',
};

const Probe = ({ skip }) => {
  const { data, isFetching, isError } = useGetProductInfoQuery(undefined, { skip });

  if (isFetching) return <p>LOADING</p>;
  if (isError) return <p>ERROR</p>;
  if (!data) return <p>NO DATA</p>;

  return (
    <div>
      <p>UDI: {data.udi}</p>
      <p>RELEASED: {data.releaseDate}</p>
      <p>PRODUCT: {data.productName}</p>
      <p>MANUFACTURER: {data.manufacturerName}</p>
      <p>ADDRESS: {data.manufacturerAddress}</p>
    </div>
  );
};

Probe.propTypes = {
  skip: PropTypes.bool,
};

const server = setupServer();

describe('productInfoApi getProductInfo', () => {
  let originalVersion;
  let requests;

  const renderProbe = (props = {}) => {
    const store = setupStore();
    const ui = (skip) => <Provider store={store}><Probe skip={skip} /></Provider>;
    const { rerender } = render(ui(props.skip));
    return { rerenderWith: (skip) => rerender(ui(skip)) };
  };

  const respondWith = (response) => server.use(
    http.post(UDI_URL, async ({ request }) => {
      requests.push(await request.json());
      return response();
    })
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    requests = [];
    originalVersion = window.config.VERSION;
    window.config.VERSION = '9.9.9';
  });

  afterEach(() => {
    server.resetHandlers();
    window.config.VERSION = originalVersion;
  });

  afterAll(() => server.close());

  it('posts the running web version as clientVersion', async () => {
    respondWith(() => HttpResponse.json(UDI_RESPONSE));
    renderProbe();

    await screen.findByText(`UDI: ${UDI_RESPONSE.udi}`);
    expect(requests).toEqual([{ clientVersion: '9.9.9' }]);
  });

  it('posts only major.minor.patch for a prerelease build', async () => {
    window.config.VERSION = '1.101.1-web-4722-merged-clinic-share-codes.1';
    respondWith(() => HttpResponse.json(UDI_RESPONSE));
    renderProbe();

    await screen.findByText(`UDI: ${UDI_RESPONSE.udi}`);
    expect(requests).toEqual([{ clientVersion: '1.101.1' }]);
  });

  it('exposes the response fields unchanged', async () => {
    respondWith(() => HttpResponse.json(UDI_RESPONSE));
    renderProbe();

    expect(await screen.findByText('UDI: (01)00884400418012(11)261103(8012)1.103.2-868bd7b')).toBeInTheDocument();
    expect(screen.getByText('RELEASED: 2026-11-03')).toBeInTheDocument();
    expect(screen.getByText('PRODUCT: Tidepool Data Platform')).toBeInTheDocument();
    expect(screen.getByText('MANUFACTURER: Tidepool Project')).toBeInTheDocument();
    expect(screen.getByText('ADDRESS: 555 Bryant St., #429, Palo Alto, CA 94301')).toBeInTheDocument();
  });

  it('errors after a single request when the release is unavailable', async () => {
    respondWith(() => HttpResponse.json({ code: 'udi-unavailable' }, { status: 503 }));
    renderProbe();

    expect(await screen.findByText('ERROR')).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it('refetches without showing the previous response when re-subscribed after being skipped', async () => {
    respondWith(() => HttpResponse.json(UDI_RESPONSE));
    const { rerenderWith } = renderProbe({ skip: true });
    expect(requests).toHaveLength(0);

    rerenderWith(false);
    await screen.findByText(`UDI: ${UDI_RESPONSE.udi}`);
    expect(requests).toHaveLength(1);

    rerenderWith(true);
    // Closing and reopening is user-paced; one macrotask lets the unused cache entry expire
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    rerenderWith(false);

    expect(screen.getByText('LOADING')).toBeInTheDocument();
    await screen.findByText(`UDI: ${UDI_RESPONSE.udi}`);
    expect(requests).toHaveLength(2);
  });
});
