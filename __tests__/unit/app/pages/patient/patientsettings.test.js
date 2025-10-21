/* global jest */
/* global expect */
/* global describe */
/* global afterEach */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MMOLL_UNITS, MGDL_UNITS } from '@app/core/constants';

import PatientSettings from '@app/pages/patient/patientsettings';
import userEvent from '@testing-library/user-event';

const mockStore = configureStore([thunk]);

describe('PatientSettings', () => {
  let store;
  const props = {
    api: { clinics: { getClinicsForPatient: jest.fn() } },
    editingAllowed: true,
    patient: {},
    onUpdatePatientSettings: jest.fn(),
    trackMetric: jest.fn(),
  };

  beforeEach(() => {
    store = mockStore({
      blip: {
        clinics: {},
        working: {
          fetchingClinicsForPatient: {},
        },
      },
    });

    props.api.clinics.getClinicsForPatient.mockClear();
    props.onUpdatePatientSettings.mockClear();
    props.trackMetric.mockClear();
  });

  describe('render', () => {
    it('should render without errors and display default BG settings when provided all required props', () => {
      const { rerender } = render(
        <Provider store={store}>
          <PatientSettings {...props} />
        </Provider>
      );

      expect(screen.getByText('70 mg/dL')).toBeInTheDocument();
      expect(screen.getByText('180 mg/dL')).toBeInTheDocument();

      rerender(
        <Provider store={store}>
          <PatientSettings
            {...props}
            patient={{ settings: { units: { bg: MMOLL_UNITS } } }}
          />
        </Provider>
      );

      expect(screen.getByText('3.9 mmol/L')).toBeInTheDocument();
      expect(screen.getByText('10.0 mmol/L')).toBeInTheDocument();
    });

    it('should display a patients BG settings with proper formatting when provided by the patient prop', () => {
      const { rerender } = render(
        <Provider store={store}>
          <PatientSettings
            {...props}
            patient={{
              settings: { bgTarget: { low: 60, high: 190 },
              units: { bg: MGDL_UNITS } },
            }}
          />
        </Provider>
      );

      expect(screen.getByText('60 mg/dL')).toBeInTheDocument();
      expect(screen.getByText('190 mg/dL')).toBeInTheDocument();

      rerender(
        <Provider store={store}>
          <PatientSettings
            {...props}
            patient={{
              settings: { bgTarget: { low: 4, high: 12.3 },
              units: { bg: MMOLL_UNITS } },
            }}
          />
        </Provider>
      );

      expect(screen.getByText('4.0 mmol/L')).toBeInTheDocument();
      expect(screen.getByText('12.3 mmol/L')).toBeInTheDocument();
    });
  });

  describe('resetRange', () => {
    it('should return an object with default settings when reset link is clicked', async () => {
      const props = {
        api: { clinics: { getClinicsForPatient: jest.fn() } },
        editingAllowed: true,
        user: {},
        patient: { userid: 1234 },
        onUpdatePatientSettings: jest.fn(),
        trackMetric: jest.fn(),
      };

      render(
        <Provider store={store}>
          <PatientSettings {...props} />
        </Provider>
      );

      expect(props.onUpdatePatientSettings).not.toHaveBeenCalled();

      await userEvent.click(screen.getByText('Reset to default'));

      expect(props.onUpdatePatientSettings).toHaveBeenCalledWith(
        1234,
        { bgTarget: { low: 70, high: 180 } }
      );
    });

    it('should return an object with default mmol/L settings when reset link is clicked', async () => {
      const props = {
        api: { clinics: { getClinicsForPatient: jest.fn() } },
        editingAllowed: true,
        user: {},
        patient: {
          userid: 1234,
          settings: { units: { bg: MMOLL_UNITS } },
        },
        onUpdatePatientSettings: jest.fn(),
        trackMetric: jest.fn(),
      };

      render(
        <Provider store={store}>
          <PatientSettings {...props} />
        </Provider>
      );

      expect(props.onUpdatePatientSettings).not.toHaveBeenCalled();

      await userEvent.click(screen.getByText('Reset to default'));

      expect(props.onUpdatePatientSettings).toHaveBeenCalledWith(
        1234,
        { bgTarget: { low: 3.9, high: 10.0 } }
      );


    });

  });

  describe('onIncrementChange', function() {
    const props = {
      api: { clinics: { getClinicsForPatient: jest.fn() } },
      editingAllowed: true,
      user: {},
      patient: { userid: 1234 },
      onUpdatePatientSettings: jest.fn(),
      trackMetric: jest.fn(),
    };

    it('should not show an error when incrementing to a valid range', async () => {
      render(
        <Provider store={store}>
          <PatientSettings
            {...props}
            patient={{
              userid: 1234,
              settings: { bgTarget: { low: 95, high: 105 },
              units: { bg: MGDL_UNITS } },
            }}
          />
        </Provider>
      );

      const incrementLowerBoundIcon = document.getElementsByClassName('IncrementalInputArrow--increase')[0].children[0]; // eslint-disable-line

      expect(screen.getByText('95 mg/dL')).toBeInTheDocument();
      expect(screen.getByText('105 mg/dL')).toBeInTheDocument();

      await userEvent.click(incrementLowerBoundIcon);

      await waitFor(() => expect(props.onUpdatePatientSettings).toHaveBeenCalled());

      expect(props.onUpdatePatientSettings).toHaveBeenCalledWith(
        1234,
        { bgTarget: { low: 100, high: 105 } }
      );

      expect(props.trackMetric).toHaveBeenCalledTimes(1);
    });

    it('should prevent incrementing to an invalid range', async () => {
      render(
        <Provider store={store}>
          <PatientSettings
            {...props}
            patient={{
              userid: 1234,
              settings: { bgTarget: { low: 100, high: 105 },
              units: { bg: MGDL_UNITS } },
            }}
          />
        </Provider>
      );

      const incrementLowerBoundIcon = document.getElementsByClassName('IncrementalInputArrow--increase')[0].children[0]; // eslint-disable-line

      expect(screen.getByText('100 mg/dL')).toBeInTheDocument();
      expect(screen.getByText('105 mg/dL')).toBeInTheDocument();

      await userEvent.click(incrementLowerBoundIcon);

      await waitFor(() => expect(props.onUpdatePatientSettings).toHaveBeenCalled());

      expect(props.onUpdatePatientSettings).toHaveBeenCalledWith(
        1234,
        { bgTarget: { low: 100, high: 105 } }
      );
    });
  });
});
