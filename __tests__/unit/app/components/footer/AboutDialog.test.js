/* global jest, expect, describe, beforeEach, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AboutDialog from '@app/components/footer/AboutDialog';
import { useGetProductInfoQuery } from '@app/redux/features/productInfo/productInfoApi';

jest.mock('@app/redux/features/productInfo/productInfoApi');

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

describe('AboutDialog', () => {
  const onClose = jest.fn();
  const trackMetric = jest.fn();
  const props = { open: true, onClose, trackMetric, version: '1.103.2-qa5' };

  const renderDialog = (overrides = {}) => {
    const { rerender } = render(<AboutDialog {...props} {...overrides} />);
    return { rerenderWith: (p) => rerender(<AboutDialog {...props} {...p} />) };
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

  beforeEach(() => {
    onClose.mockClear();
    trackMetric.mockClear();
    useGetProductInfoQuery.mockClear();
    useGetProductInfoQuery.mockReturnValue({ data: UDI_RESPONSE, isFetching: false, isError: false });
  });

  it('renders the product, release date, UDI, manufacturer and links from the response', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: 'About Tidepool' })).toBeInTheDocument();
    expect(screen.getByText('Tidepool Data Platform')).toBeInTheDocument();
    expect(screen.getByText('Latest Software Release Date: 2026-11-03')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Unique Device Identifier' })).toBeInTheDocument();
    expect(screen.getByTestId('about-udi')).toHaveTextContent('(01)00884400418012(11)261103(8012)1.103.2-868bd7b');
    expect(screen.getByRole('img', { name: 'Manufacturer' })).toBeInTheDocument();
    expect(screen.getByText('Tidepool Project')).toBeInTheDocument();
    expect(screen.getByText('555 Bryant St., #429, Palo Alto, CA 94301')).toBeInTheDocument();
    expectVersionAndLinks();
  });

  it('takes its accessible name from its own title when another dialog title is mounted', () => {
    render(<h3 id="dialog-title">One More Step!</h3>);
    renderDialog();

    expect(screen.getByRole('dialog', { name: 'About Tidepool' })).toBeInTheDocument();
  });

  it('shows the loading text and hides the previous response while refetching', () => {
    useGetProductInfoQuery.mockReturnValue({ data: UDI_RESPONSE, isFetching: true, isError: false });
    renderDialog();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expectApiRowsAbsent();
    expectVersionAndLinks();
  });

  it('shows the unavailable text and hides the previous response when the request fails', () => {
    useGetProductInfoQuery.mockReturnValue({ data: UDI_RESPONSE, isFetching: false, isError: true });
    renderDialog();

    expect(screen.getByText('Unable to load release information.')).toBeInTheDocument();
    expectApiRowsAbsent();
    expectVersionAndLinks();
  });

  it.each([
    ['without a udi', { ...UDI_RESPONSE, udi: undefined }],
    ['with an empty body', null],
  ])('shows the unavailable text for a successful response %s', (_label, data) => {
    useGetProductInfoQuery.mockReturnValue({ data, isFetching: false, isError: false });
    renderDialog();

    expect(screen.getByText('Unable to load release information.')).toBeInTheDocument();
    expectApiRowsAbsent();
  });

  it('calls onClose from the close icon', async () => {
    renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('tracks a metric for each link', async () => {
    renderDialog();

    await userEvent.click(screen.getByRole('link', { name: 'Privacy and Terms of Use' }));
    await userEvent.click(screen.getByRole('link', { name: 'X' }));
    await userEvent.click(screen.getByRole('link', { name: 'Facebook' }));

    expect(trackMetric.mock.calls).toEqual([
      ['Clicked Footer PP and TOU'],
      ['Clicked Footer Twitter'],
      ['Clicked Footer Facebook'],
    ]);
  });

  it('only requests product info while open', () => {
    const { rerenderWith } = renderDialog({ open: false });
    expect(useGetProductInfoQuery).toHaveBeenLastCalledWith(undefined, { skip: true });

    rerenderWith({ open: true });
    expect(useGetProductInfoQuery).toHaveBeenLastCalledWith(undefined, { skip: false });
  });
});
