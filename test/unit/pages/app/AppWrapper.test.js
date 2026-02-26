import React from 'react';
import { render, screen } from '@testing-library/react';
import AppWrapper from '../../../../app/pages/app/AppWrapper';

const mockUseProviderConnectionPopup = jest.fn();
const mockAppBanner = jest.fn(({ trackMetric }) => <div data-testid="app-banner" data-trackmetric={trackMetric ? 'present' : 'missing'} />);

jest.mock('../../../../app/providers/AppBanner/AppBanner', () => props => mockAppBanner(props));
jest.mock('../../../../app/components/datasources/useProviderConnectionPopup', () => (...args) => mockUseProviderConnectionPopup(...args));

/* global describe */
/* global it */
/* global expect */
describe('AppWrapper', () => {
  const trackMetricStub = jest.fn();

  beforeEach(() => {
    mockUseProviderConnectionPopup.mockReset();
    mockAppBanner.mockClear();
    trackMetricStub.mockReset();
  });

  it('should call useProviderConnectionPopup hook', () => {
    render(<AppWrapper trackMetric={trackMetricStub}><div className="child" /></AppWrapper>);
    expect(mockUseProviderConnectionPopup).toHaveBeenCalledTimes(1);
    expect(mockUseProviderConnectionPopup).toHaveBeenCalledWith({ trackMetric: trackMetricStub });
  });

  it('should render AppBanner with trackMetric prop', () => {
    render(<AppWrapper trackMetric={trackMetricStub}><div className="child" /></AppWrapper>);
    expect(screen.getByTestId('app-banner')).toBeTruthy();
    expect(mockAppBanner).toHaveBeenCalled();
    expect(mockAppBanner.mock.calls[0][0].trackMetric).toEqual(trackMetricStub);
  });

  it('should render children passed to it', () => {
    render(
      <AppWrapper trackMetric={trackMetricStub}>
        <div className="child1" />
        <div className="child2" />
      </AppWrapper>
    );
    expect(document.querySelector('.child1')).toBeTruthy();
    expect(document.querySelector('.child2')).toBeTruthy();
  });
});
