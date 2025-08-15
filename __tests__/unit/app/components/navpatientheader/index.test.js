/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import _ from 'lodash';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import { useNavigation } from '@app/core/navutils';
import { useToasts } from '@app/providers/ToastProvider';

import NavPatientHeader from '@app/components/navpatientheader';
import userEvent from '@testing-library/user-event';

jest.mock('@app/core/navutils.js', () => ({
  __esModule: true,
  ...jest.requireActual('@app/core/navutils.js'),

  useNavigation: jest.fn().mockReturnValue({
    handleBack: jest.fn(),
    handleLaunchUploader: jest.fn(),
    handleViewData: jest.fn(),
    handleViewProfile: jest.fn(),
    handleShare: jest.fn(),
  }),
}));

jest.mock('@app/providers/ToastProvider', () => ({
  useToasts: jest.fn().mockReturnValue({
    set: jest.fn(),
  }),
}));

describe('NavPatientHeader', () => {
  const trackMetric = jest.fn();
  const api = {};

  const patientProps = {
    userid: '1234',
    profile: {
      fullName: 'Vasyl Lomachenko',
      patient: { birthday: '2010-10-20', mrn: '567890' },
    },
  };

  const clinicPatientProps = {
    id: '1234',
    birthDate: '1965-01-01',
    fullName: 'Naoya Inoue',
    mrn: '999999',
    diagnosisType: 'prediabetes',
  };

  const mockStore = configureStore([thunk]);
  let store;

  beforeEach(() => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic-123',
        currentPatientInViewId: 'patient-123',
        clinics: { 'clinic-123': { patients: { 'patient-123': {} } } },
        clinicMrnsForPatientFormValidation: [],
        working: {
          updatingClinicPatient: { inProgress: false, notification: null, completed: null },
          fetchingClinicMRNsForPatientFormValidation: { inProgress: false, notification: null, completed: null },
        },
      },
    });
  });

  afterEach(() => {
    trackMetric.mockClear();

    useNavigation().handleBack.mockClear();
    useNavigation().handleLaunchUploader.mockClear();
    useNavigation().handleViewData.mockClear();
    useNavigation().handleViewProfile.mockClear();
    useNavigation().handleShare.mockClear();
  });

  const MockedProviderWrappers = ({ children, path = '/' }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Switch>
          <Route path={path}>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    </Provider>
  );

  describe('visibility of patient info and actions', () => {
    describe('personal user with non-root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: undefined,
      };

      it('shows the correct info and actions', () => {
        render(
          <MockedProviderWrappers>
            <NavPatientHeader {...props} />
          </MockedProviderWrappers>
        );

        // should show demographic info from the 'patient' object
        expect(screen.getByText(/Vasyl Lomachenko/)).toBeInTheDocument();
        expect(screen.queryByText(/567890/)).not.toBeInTheDocument();
        expect(screen.queryByText(/2010-10-20/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Pre-diabetes/)).not.toBeInTheDocument();

        // should NOT show demographic info from the 'clinicPatient' object
        expect(screen.queryByText(/Naoya Inoue/)).not.toBeInTheDocument();
        expect(screen.queryByText(/999999/)).not.toBeInTheDocument();
        expect(screen.queryByText(/1965-01-01/)).not.toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Back/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Data/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Profile/ })).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Share/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Upload Data/ })).not.toBeInTheDocument();
      });
    });

    describe('personal user with root permissions', () => {
      const props = {
        user: { roles: [] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: undefined,
      };

      it('shows the correct info and actions', () => {
        render(
          <MockedProviderWrappers>
            <NavPatientHeader {...props} />
          </MockedProviderWrappers>
        );

        // should show demographic info from the 'patient' object
        expect(screen.getByText(/Vasyl Lomachenko/)).toBeInTheDocument();
        expect(screen.queryByText(/Naoya Inoue/)).not.toBeInTheDocument();
        expect(screen.queryByText(/567890/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Pre-diabetes/)).not.toBeInTheDocument();

        // should NOT show demographic info from the 'clinicPatient' object
        expect(screen.queryByText(/2010-10-20/)).not.toBeInTheDocument();
        expect(screen.queryByText(/999999/)).not.toBeInTheDocument();
        expect(screen.queryByText(/1965-01-01/)).not.toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Back/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Data/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Profile/ })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Share/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Data/ })).toBeInTheDocument();
      });
    });

    describe('clinician user without upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: {},
      };

      it('shows the correct info and actions', () => {
        render(
          <MockedProviderWrappers>
            <NavPatientHeader {...props} />
          </MockedProviderWrappers>
        );

        // should show demographic info from the 'clinicPatient' object
        expect(screen.getByText(/Naoya Inoue/)).toBeInTheDocument();
        expect(screen.getByText(/999999/)).toBeInTheDocument();
        expect(screen.getByText(/1965-01-01/)).toBeInTheDocument();
        expect(screen.getByText(/Pre-diabetes/)).toBeInTheDocument();

        // should NOT show demographic info from the 'patient' object
        expect(screen.queryByText(/Vasyl Lomachenko/)).not.toBeInTheDocument();
        expect(screen.queryByText(/567890/)).not.toBeInTheDocument();
        expect(screen.queryByText(/2010-10-20/)).not.toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Data/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Profile/ })).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Share/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Upload Data/ })).not.toBeInTheDocument();
      });
    });

    describe('clinician user with upload permissions', () => {
      const props = {
        user: { roles: ['clinician'] },
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { root: {} } },
        clinicPatient: { ...clinicPatientProps },
        permsOfLoggedInUser: { upload: {} },
      };

      it('shows the correct info and actions', () => {
        render(
          <MockedProviderWrappers>
            <NavPatientHeader {...props} />
          </MockedProviderWrappers>
        );

        // should show demographic info from the 'clinicPatient' object
        expect(screen.getByText(/Naoya Inoue/)).toBeInTheDocument();
        expect(screen.getByText(/999999/)).toBeInTheDocument();
        expect(screen.getByText(/1965-01-01/)).toBeInTheDocument();
        expect(screen.getByText(/Pre-diabetes/)).toBeInTheDocument();

        // should NOT show demographic info from the 'patient' object
        expect(screen.queryByText(/Vasyl Lomachenko/)).not.toBeInTheDocument();
        expect(screen.queryByText(/567890/)).not.toBeInTheDocument();
        expect(screen.queryByText(/2010-10-20/)).not.toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Data/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Profile/ })).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Share/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Data/ })).toBeInTheDocument();
      });
    });
  });

  describe('button functions for personal users', () => {
    const props = {
      user: { roles: [] },
      trackMetric,
      api,
      patient: { ...patientProps, permissions: { root: {} } },
      clinicPatient: { ...clinicPatientProps },
    };

    it('Buttons link to correct page', async () => {
      render(
        <MockedProviderWrappers>
          <NavPatientHeader {...props} />
        </MockedProviderWrappers>
      );

      await userEvent.click(screen.getByRole('button', { name: /View Data/ }));
      expect(useNavigation().handleViewData).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole('button', { name: /Profile/ }));
      expect(useNavigation().handleViewProfile).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole('button', { name: /Share/ }));
      expect(useNavigation().handleShare).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole('button', { name: /Upload Data/ }));
      expect(useNavigation().handleLaunchUploader).toHaveBeenCalledTimes(1);
    });
  });

  describe('button functions for clinician users', () => {
    const props = {
      user: { roles: ['clinician'] },
      trackMetric,
      api,
      patient: { ...patientProps, permissions: { } },
      clinicPatient: { ...clinicPatientProps },
      permsOfLoggedInUser: { upload: {} }
    };

    it('Buttons link to correct page', async () => {
      render(
        <MockedProviderWrappers>
          <NavPatientHeader {...props} />
        </MockedProviderWrappers>
      );

      await userEvent.click(screen.getByRole('button', { name: /View Data/ }));
      expect(useNavigation().handleViewData).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole('button', { name: /Upload Data/ }));
      expect(useNavigation().handleLaunchUploader).toHaveBeenCalledTimes(1);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /Edit Patient Details/ }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('back button', () => {
    describe('viewing patient data or profile views as a clinician user', () => {
      const clinicianUserProps = {
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        user: { roles: ['clinic'] },
      };

      it('should render on data page', async () => {
        render(
          <MockedProviderWrappers path='/patients/abc123/data'>
            <NavPatientHeader {...clinicianUserProps} />
          </MockedProviderWrappers>
        );

        await userEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(useNavigation().handleBack).toHaveBeenCalledTimes(1);
      });

      it('should render on profile page', async () => {
        render(
          <MockedProviderWrappers path='/patients/abc123/profile'>
            <NavPatientHeader {...clinicianUserProps} />
          </MockedProviderWrappers>
        );

        await userEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(useNavigation().handleBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('viewing patient data or profile views as a clinic clinician', () => {
      const clinicClinicianProps = {
        trackMetric,
        api,
        patient: { ...patientProps, permissions: { } },
        clinicPatient: { ...clinicPatientProps },
        clinicFlowActive: true,
        user: { isClinicMember: true },
        selectedClinicId: 'clinic123',
      };

      it('should render on view page', async () => {
        render(
          <MockedProviderWrappers path='/patients/abc123/data'>
            <NavPatientHeader {...clinicClinicianProps} />
          </MockedProviderWrappers>
        );

        await userEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(useNavigation().handleBack).toHaveBeenCalledTimes(1);
      });

      it('should render on profile page', async () => {
        render(
          <MockedProviderWrappers path='/patients/abc123/data'>
            <NavPatientHeader {...clinicClinicianProps} />
          </MockedProviderWrappers>
        );

        await userEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(useNavigation().handleBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('viewing the TIDE dashboard view as a clinic clinician', () => {
      it('should render a patient list link', async () => {
        const clinicClinicianProps = {
          trackMetric,
          api,
          patient: { ...patientProps, permissions: { } },
          clinicPatient: { ...clinicPatientProps },
          clinicFlowActive: true,
          user: { isClinicMember: true },
          selectedClinicId: 'clinic123',
        };

        render(
          <MockedProviderWrappers path='/dashboard/tide'>
            <NavPatientHeader {...clinicClinicianProps} />
          </MockedProviderWrappers>
        );

        await userEvent.click(screen.getByRole('button', { name: /Back/ }));
        expect(useNavigation().handleBack).toHaveBeenCalledTimes(1);
      });
    });
  });
});
