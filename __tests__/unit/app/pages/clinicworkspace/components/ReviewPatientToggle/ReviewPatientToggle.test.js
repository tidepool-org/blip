/* global jest, beforeEach, describe, it, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { thunk } from 'redux-thunk';
import moment from 'moment';

import ReviewPatientToggle from '@app/pages/clinicworkspace/components/ReviewPatientToggle';

// metricUtils must be imported relatively — the @app alias resolves to the real module
import { trackMetric as mockTrackMetric } from '../../../../../../../app/core/metricUtils';

describe('ReviewPatientToggle', () => {
  // Review times are formatted against the real clock, so anchor the fixtures to the current moment
  const now = moment().toISOString();
  const threeDaysAgo = moment().subtract(3, 'days').toISOString();
  const longAgo = '2024-03-05T12:00:00.000Z';

  const defaultState = { blip: { loggedInUserId: 'user2', selectedClinicId: 'clinic7' } };

  const onReview = jest.fn();
  const onUndo = jest.fn();

  const mockStore = configureStore([thunk]);
  let store;

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <ReviewPatientToggle
          patientId="patient1"
          onReview={onReview}
          onUndo={onUndo}
          recentlyReviewedThresholdDate={moment().subtract(7, 'days').toISOString()}
          {...props}
        />
      </MemoryRouter>
    </Provider>
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeEach(() => {
    store = mockStore(defaultState);

    onReview.mockClear();
    onUndo.mockClear();
    mockTrackMetric.mockClear();
  });

  it('allows review if patient never reviewed', async () => {
    renderComponent({ reviews: [] });

    expect(screen.getByText('-')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient1',
      pageName: 'Population Health',
    });

    expect(onReview).toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('allows undo if reviewed today by current user', async () => {
    renderComponent({ reviews: [{ clinicianId: 'user2', time: now }] });

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Reviewed' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Undo mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient1',
      pageName: 'Population Health',
    });

    expect(onUndo).toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('disallows any action if reviewed today by other clinician', async () => {
    renderComponent({ reviews: [{ clinicianId: 'user1', time: now }] });

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('allows review if patient reviewed within the past week', async () => {
    renderComponent({ reviews: [{ clinicianId: 'user2', time: threeDaysAgo }] });

    expect(screen.getByText('3 days ago')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient1',
      pageName: 'Population Health',
    });

    expect(onReview).toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('allows review if patient reviewed within the past week', async () => {
    renderComponent({ reviews: [{ clinicianId: 'user2', time: longAgo }] });

    expect(screen.getByText('2024-03-05')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient1',
      pageName: 'Population Health',
    });

    expect(onReview).toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('fires no actions while a review update is processing', async () => {
    const { rerender } = renderComponent({ reviews: [], processing: true });

    expect(screen.getByRole('button', { name: 'Mark Reviewed' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Mark Reviewed' }));

    rerender(ui({ reviews: [{ clinicianId: 'user2', time: now }], processing: true }));

    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });
});
