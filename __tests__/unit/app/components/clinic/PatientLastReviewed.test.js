/* global jest, beforeEach, describe, it, expect */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { thunk } from 'redux-thunk';
import moment from 'moment';

import { ToastProvider } from '@app/providers/ToastProvider';
import PatientLastReviewed from '@app/components/clinic/PatientLastReviewed';

// metricUtils must be imported relatively — the @app alias resolves to the real module
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';

describe('PatientLastReviewed', () => {
  // Review times are formatted against the real clock, so anchor the fixtures to the current moment
  const today = moment().toISOString();
  const yesterday = moment().subtract(1, 'day').toISOString();
  const monthAgo = moment().subtract(30, 'days').toISOString();

  const defaultWorkingState = {
    inProgress: false,
    completed: null,
    notification: null,
  };

  const defaultState = {
    blip: {
      loggedInUserId: 'user2',
      selectedClinicId: 'clinic7',
      clinics: {
        clinic7: {
          id: 'clinic7',
          patients: {
            patient1: { id: 'patient1', reviews: [{ clinicianId: 'user2', time: today }, { clinicianId: 'user2', time: yesterday }] },
            patient2: { id: 'patient2', reviews: [{ clinicianId: 'user2', time: yesterday }] },
            patient3: { id: 'patient3', reviews: [{ clinicianId: 'user2', time: monthAgo }] },
            patient4: { id: 'patient4', reviews: [{ clinicianId: 'user2', time: '2024-03-05T12:00:00.000Z' }] },
            patient5: { id: 'patient5', reviews: [] },
          },
        },
      },
      working: {
        settingClinicPatientLastReviewed: defaultWorkingState,
        revertingClinicPatientLastReviewed: defaultWorkingState,
      },
    },
  };

  const api = {
    clinics: {
      setClinicPatientLastReviewed: jest.fn(),
      revertClinicPatientLastReviewed: jest.fn(),
    },
  };

  const mockStore = configureStore([thunk]);
  let store;

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <ToastProvider>
          <PatientLastReviewed api={api} patientId="patient1" {...props} />
        </ToastProvider>
      </MemoryRouter>
    </Provider>
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeEach(() => {
    store = mockStore(defaultState);

    api.clinics.setClinicPatientLastReviewed.mockReset();
    api.clinics.revertClinicPatientLastReviewed.mockReset();

    api.clinics.setClinicPatientLastReviewed.mockImplementation((cId, pId, cb) => cb(null, [today, yesterday]));
    api.clinics.revertClinicPatientLastReviewed.mockImplementation((cId, pId, cb) => cb(null, [yesterday]));

    mockTrackMetric.mockClear();
  });

  it('renders the time since the patient was last reviewed', () => {
    const { rerender } = renderComponent({ patientId: 'patient1' });
    expect(screen.getByText('Today')).toBeInTheDocument();

    rerender(ui({ patientId: 'patient2' }));
    expect(screen.getByText('Yesterday')).toBeInTheDocument();

    rerender(ui({ patientId: 'patient3' }));
    expect(screen.getByText('30 days ago')).toBeInTheDocument();


    rerender(ui({ patientId: 'patient4' })); // >30 days ago, should show the review date
    expect(screen.getByText('2024-03-05')).toBeInTheDocument();

    rerender(ui({ patientId: 'patient5' })); // no reviews
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('allows marking a patient as reviewed', async () => {
    renderComponent({ patientId: 'patient2' });

    expect(screen.getByText('Yesterday')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Mark Reviewed/ }));

    await waitFor(() => expect(api.clinics.setClinicPatientLastReviewed).toHaveBeenCalled());

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient2',
      pageName: 'Population Health',
    });

    expect(api.clinics.setClinicPatientLastReviewed).toHaveBeenCalledWith(
      'clinic7',
      'patient2',
      expect.any(Function),
    );

    expect(store.getActions()).toStrictEqual([
      { type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
      {
        type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
        payload: { clinicId: 'clinic7', patientId: 'patient2', reviews: [today, yesterday] },
      },
    ]);
  });

  it('allows undoing a review marked earlier today', async () => {
    renderComponent({ patientId: 'patient1' });

    expect(screen.getByText('Today')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Undo/ }));

    await waitFor(() => expect(api.clinics.revertClinicPatientLastReviewed).toHaveBeenCalled());

    expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Undo mark patient reviewed', {
      clinicId: 'clinic7',
      patientID: 'patient1',
      pageName: 'Population Health',
    });

    expect(api.clinics.revertClinicPatientLastReviewed).toHaveBeenCalledWith(
      'clinic7',
      'patient1',
      expect.any(Function),
    );

    expect(store.getActions()).toStrictEqual([
      { type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
      {
        type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
        payload: { clinicId: 'clinic7', patientId: 'patient1', reviews: [yesterday] },
      },
    ]);
  });
});
