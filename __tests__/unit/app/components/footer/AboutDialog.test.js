/* global jest, expect, describe, beforeAll, beforeEach, afterAll, afterEach, it */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import AboutDialog from '@app/components/footer/AboutDialog';
import { setupStore } from '@tests/utils/setupStore';

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

const server = setupServer();

describe('AboutDialog', () => {
  const onClose = jest.fn();
  const trackMetric = jest.fn();
  const props = { open: true, onClose, trackMetric, version: '1.103.2-qa5' };
  let originalVersion;
  let requests;

  const respondWith = (response) => server.use(
    http.post(UDI_URL, async ({ request }) => {
      requests.push(await request.json());
      return response();
    })
  );

  const renderDialog = (overrides = {}) => {
    const store = setupStore();
    const ui = (p) => <Provider store={store}><AboutDialog {...props} {...p} /></Provider>;
    const { rerender } = render(ui(overrides));
    return { rerenderWith: (p) => rerender(ui(p)) };
  };

  const expectApiRowsAbsent = () => {
    expect(screen.queryByText('Tidepool Data Platform')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Latest Software Release Date/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('about-udi')).not.toBeInTheDocument();
    expect(screen.queryByText('Tidepool Project')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Manufacturer' })).not.toBeInTheDocument();
  };

  const expectVersionAndLinks = () => {
    expect(screen.getByText('Version 1.103.2-qa5')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy and Terms of Use' })).toHaveAttribute('href', 'https://tidepool.org/legal/');
    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/tidepool_org');
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/TidepoolOrg');
  };

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    onClose.mockClear();
    trackMetric.mockClear();
    requests = [];
    originalVersion = window.config.VERSION;
    window.config.VERSION = '1.103.2';
    respondWith(() => HttpResponse.json(UDI_RESPONSE));
  });

  afterEach(() => {
    server.resetHandlers();
    window.config.VERSION = originalVersion;
  });

  afterAll(() => server.close());

  it('renders the product, release date, UDI, manufacturer and links from the response', async () => {
    renderDialog();

    expect(await screen.findByTestId('about-udi')).toHaveTextContent('(01)00884400418012(11)261103(8012)1.103.2-868bd7b');
    expect(screen.getByRole('heading', { name: 'About Tidepool' })).toBeInTheDocument();
    expect(screen.getByText('Tidepool Data Platform')).toBeInTheDocument();
    expect(screen.getByText('Latest Software Release Date: 2026-11-03')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Unique Device Identifier' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Manufacturer' })).toBeInTheDocument();
    expect(screen.getByText('Tidepool Project')).toBeInTheDocument();
    expect(screen.getByText('555 Bryant St., #429, Palo Alto, CA 94301')).toBeInTheDocument();
    expectVersionAndLinks();
  });

  it('takes its accessible name from its own title when another dialog title is mounted', async () => {
    render(<h3 id="dialog-title">One More Step!</h3>);
    renderDialog();

    await screen.findByTestId('about-udi');
    expect(screen.getByRole('dialog', { name: 'About Tidepool' })).toBeInTheDocument();
  });

  it('posts only major.minor.patch of the web version as clientVersion', async () => {
    window.config.VERSION = '1.101.1-web-4722-merged-clinic-share-codes.1';
    renderDialog();

    await screen.findByTestId('about-udi');
    expect(requests).toEqual([{ clientVersion: '1.101.1' }]);
  });

  it('shows the unavailable text after a single request when the lookup fails', async () => {
    respondWith(() => HttpResponse.json({ code: 'udi-unavailable' }, { status: 503 }));
    renderDialog();

    expect(await screen.findByText('Unable to load release information.')).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expectApiRowsAbsent();
    expectVersionAndLinks();
  });

  it.each([
    ['without a udi', () => HttpResponse.json({ ...UDI_RESPONSE, udi: undefined })],
    ['with an empty body', () => new HttpResponse(null, { status: 200 })],
  ])('shows the unavailable text for a successful response %s', async (_label, response) => {
    respondWith(response);
    renderDialog();

    expect(await screen.findByText('Unable to load release information.')).toBeInTheDocument();
    expectApiRowsAbsent();
  });

  it('requests only while open and refetches on reopen without showing the previous response', async () => {
    const { rerenderWith } = renderDialog({ open: false });
    expect(requests).toHaveLength(0);

    rerenderWith({ open: true });
    await screen.findByTestId('about-udi');
    expect(requests).toHaveLength(1);

    rerenderWith({ open: false });
    // Closing and reopening is user-paced; one macrotask lets the unused cache entry expire
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    rerenderWith({ open: true });

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByTestId('about-udi')).not.toBeInTheDocument();
    await screen.findByTestId('about-udi');
    expect(requests).toHaveLength(2);
  });

  it('calls onClose from the close icon', async () => {
    renderDialog();
    await screen.findByTestId('about-udi');

    await userEvent.click(screen.getByRole('button', { name: 'close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('tracks a metric for each link', async () => {
    renderDialog();
    await screen.findByTestId('about-udi');

    await userEvent.click(screen.getByRole('link', { name: 'Privacy and Terms of Use' }));
    await userEvent.click(screen.getByRole('link', { name: 'X' }));
    await userEvent.click(screen.getByRole('link', { name: 'Facebook' }));

    expect(trackMetric.mock.calls).toEqual([
      ['Clicked Footer PP and TOU'],
      ['Clicked Footer Twitter'],
      ['Clicked Footer Facebook'],
    ]);
  });
});
