/* global jest */
/* global expect */
/* global describe */
/* global afterEach */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import ClinicsUsingAltRangeNotifications from '@app/pages/patient/ClinicsUsingAltRangeNotifications';
import userEvent from '@testing-library/user-event';
import * as actions from '@app/redux/actions';

const mockStore = configureStore([thunk]);

jest.mock('@app/redux/actions', () => ({
  async: {
    fetchClinicsForPatient: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));

describe('ClinicsUsingAltRangeNotifications', () => {
  actions.async.fetchClinicsForPatient.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.async.updatePreferences.mockReturnValue({ type: 'MOCK_ACTION' });

  const api = { clinics: { getClinicsForPatient: jest.fn() } };

  let store;

  describe('When user is not the patient', () => {
    const state = {
      blip: {
        loggedInUserId: '4567',
        currentPatientInViewId: '1234',
        allUsersMap: { '1234': { userid: '1234' } },
        clinics: {
          '1111': {
            id: '1111',
            name: 'First Clinic',
            patients: { '1234': { glycemicRanges: { type: 'preset', preset: 'adaPregnancyType1' } } },
          },
        },
        working: {
          fetchingClinicsForPatient: { completed: true },
        },
      },
    };

    it('renders nothing', () => {
      store = mockStore(state);

      const { container } = render(
        <Provider store={store}>
          <ClinicsUsingAltRangeNotifications api={api} />
        </Provider>
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('When user is patient with multiple clinics', () => {
    const state = {
      blip: {
        loggedInUserId: '1234',
        currentPatientInViewId: '1234',
        allUsersMap: { '1234': { userid: '1234' } },
        clinics: {
          '1111': {
            id: '1111',
            name: 'First Clinic',
            patients: { '1234': { glycemicRanges: { type: 'preset', preset: 'adaPregnancyType1' } } },
          },
          '2222': {
            id: '2222',
            name: 'Second Clinic',
            patients: { '1234': { glycemicRanges: { type: 'preset', preset: 'adaStandard' } } },
          },
          '3333': {
            id: '3333',
            name: 'Third Clinic',
            patients: { '1234': { glycemicRanges: { type: 'preset', preset: 'adaHighRisk' } } },
          },
          '4444': {
            id: '4444',
            name: 'Fourth Clinic',
            preferredBgUnits: 'mmol/L',
            patients: { '1234': { glycemicRanges: { type: 'preset', preset: 'ADA pregnancy GDM or type 2' } } },
          },
        },
        working: {
          fetchingClinicsForPatient: { completed: true },
        },
      },
    };

    let store;

    it('renders a dismissible notification for each clinic with non-standard ranges', async () => {
      store = mockStore(state);

      const { container } = render(
        <Provider store={store}>
          <ClinicsUsingAltRangeNotifications api={api} />
        </Provider>
      );

      // Displays notifications for clinics using alternative target ranges.
      // Second and Third Clinic are both using target ranges of 70-180, so they do not have notifications.
      expect(container).not.toBeEmptyDOMElement();
      expect(screen.getAllByText(/Non-Standard Target Range/).length).toBe(2);
      expect(screen.getByText('First Clinic is using a non-standard target range of 63-140 mg/dL to view your data')).toBeInTheDocument();
      expect(screen.getByText('Fourth Clinic is using a non-standard target range of 3.5-7.8 mmol/L to view your data')).toBeInTheDocument();

      // Click a dismiss button. It updates the target ranges.
      const firstClinicDismissButton = screen.getAllByRole('button', { name: /Dismiss/ })[0];
      await userEvent.click(firstClinicDismissButton);

      expect(actions.async.updatePreferences).toHaveBeenCalledWith(
        api,
        '1234',
        { 'dismissedClinicAltRangeNotificationTime-1111': expect.any(String) },
      );
    });

    it('does not show notification if it has already been dismissed', () => {
      store = mockStore({
        ...state,
        blip: {
          ...state.blip,
          allUsersMap: {
            ...state.blip.allUsersMap,
            '1234': {
              ...state.blip.allUsersMap['1234'],
              preferences: { 'dismissedClinicAltRangeNotificationTime-1111': '2025-01-01T00:00:00Z' },
            },
          },
        },
      });

      render(
        <Provider store={store}>
          <ClinicsUsingAltRangeNotifications api={api} />
        </Provider>
      );

      expect(screen.getAllByText(/Non-Standard Target Range/).length).toBe(1);

      // First Clinic was dismissed previously, so it doesn't appear
      expect(screen.queryByText('First Clinic is using a non-standard target range of 63-140 mg/dL to view your data')).not.toBeInTheDocument();

      expect(screen.getByText('Fourth Clinic is using a non-standard target range of 3.5-7.8 mmol/L to view your data')).toBeInTheDocument();
    });
  });
});
