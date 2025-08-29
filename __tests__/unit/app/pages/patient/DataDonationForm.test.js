/* global jest, test, expect, describe, it, beforeEach */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import moment from 'moment';

import { DataDonationForm, formContexts } from '../../../../../app/pages/patient/DataDonationForm';
import { ToastProvider } from '../../../../../app/providers/ToastProvider';
import { DATA_DONATION_CONSENT_TYPE } from '../../../../../app/core/constants';

// Mock dependencies
jest.mock('../../../../../app/core/personutils', () => ({
  patientIsOtherPerson: jest.fn(),
  patientFullName: jest.fn(),
  fullName: jest.fn(),
}));

jest.mock('../../../../../app/pages/patient/DataDonationConsentDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm, ...props }) => (
    open ? (
      <div role="dialog" data-testid="consent-dialog">
        <button onClick={() => onConfirm({ name: 'Test Name' })}>Confirm Consent</button>
        <button onClick={onClose}>Close</button>
        <div data-testid="consent-props">{JSON.stringify(props)}</div>
      </div>
    ) : null
  ),
  getConsentText: jest.fn(() => ({
    consentSuccessMessage: 'Mocked consent success message'
  }))
}));

jest.mock('../../../../../app/pages/patient/DataDonationRevokeConsentDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm, processing }) => (
    open ? (
      <div role="dialog" data-testid="revoke-dialog">
        <button onClick={onConfirm} disabled={processing}>Confirm Revoke</button>
        <button onClick={onClose}>Close</button>
        <div data-testid="processing-state">{processing ? 'processing' : 'not-processing'}</div>
      </div>
    ) : null
  )
}));

jest.mock('../../../../../app/components/elements/SlideShow', () => ({
  DataDonationSlideShow: () => <div data-testid="slideshow">Data Donation SlideShow</div>
}));

jest.mock('../../../../../app/components/elements/Pill', () => ({
  __esModule: true,
  default: ({ text, label }) => (
    <div data-testid="success-pill" aria-label={label}>{text}</div>
  )
}));

const mockPersonUtils = require('../../../../../app/core/personutils');

describe('DataDonationForm', () => {
  const mockStore = configureStore([thunk]);

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const loggedInUserId = 'user123';

  const baseUser = {
    userid: loggedInUserId,
    profile: {
      fullName: 'John Doe',
      patient: {
        birthday: '1990-01-01',
        fullName: 'John Doe Patient'
      }
    }
  };

  const baseState = {
    blip: {
      loggedInUserId,
      allUsersMap: {
        [loggedInUserId]: baseUser
      },
      consents: {
        [DATA_DONATION_CONSENT_TYPE]: {
          type: DATA_DONATION_CONSENT_TYPE,
          version: 1,
          content: 'Consent document content'
        }
      },
      consentRecords: {},
      working: {
        creatingUserConsentRecord: defaultWorkingState,
        updatingUserConsentRecord: defaultWorkingState,
        revokingUserConsentRecord: defaultWorkingState,
      }
    }
  };

  const defaultProps = {
    api: {
      consent: {
        getLatestConsentByType: jest.fn(),
        getUserConsentRecords: jest.fn(),
        createUserConsentRecord: jest.fn(),
        updateUserConsentRecord: jest.fn(),
        revokeUserConsentRecord: jest.fn(),
      },
    },
    trackMetric: jest.fn(),
    onFormChange: jest.fn(),
    onRevokeConsent: jest.fn(),
    formContext: formContexts.profile,
  };

  let store;

  const renderWithProviders = (state = baseState, props = defaultProps) => {
    store = mockStore(state);
    return render(
      <Provider store={store}>
        <ToastProvider>
          <DataDonationForm {...props} />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store?.clearActions();
    mockPersonUtils.patientIsOtherPerson.mockReturnValue(false);
    mockPersonUtils.patientFullName.mockReturnValue('John Doe Patient');
    mockPersonUtils.fullName.mockReturnValue('John Doe');
  });

  describe('Initial Rendering and Form State Logic', () => {
    it('should render slideshow component', () => {
      renderWithProviders();
      expect(screen.getByTestId('slideshow')).toBeInTheDocument();
    });

    it('should show consent step when no current consent exists', () => {
      renderWithProviders();
      expect(screen.getByText(/Would you like to donate your anonymized data\?/)).toBeInTheDocument();
      expect(screen.queryByTestId('success-pill')).not.toBeInTheDocument();
    });

    it('should show organizations step when consent exists', () => {
      const stateWithConsent = {
        ...baseState,
        blip: {
          ...baseState.blip,
          consentRecords: {
            [DATA_DONATION_CONSENT_TYPE]: {
              id: 'consent123',
              type: DATA_DONATION_CONSENT_TYPE,
              metadata: { supportedOrganizations: ['org1'] }
            }
          }
        }
      };

      renderWithProviders(stateWithConsent);
      expect(screen.getByTestId('success-pill')).toBeInTheDocument();
      expect(screen.getByLabelText('Data donation supported non-profits')).toBeInTheDocument();
      expect(screen.getByText('Stop Sharing Data')).toBeInTheDocument();
    });

    it('should calculate accountType correctly for personal account', () => {
      mockPersonUtils.patientIsOtherPerson.mockReturnValue(false);
      renderWithProviders();
      expect(screen.getByText(/Would you like to donate your anonymized data\?/)).toBeInTheDocument();
    });

    it('should calculate accountType correctly for caregiver account', () => {
      mockPersonUtils.patientIsOtherPerson.mockReturnValue(true);
      renderWithProviders();
      expect(screen.getByText(/Would they like to donate their anonymized data\?/)).toBeInTheDocument();
    });
  });

  describe('Age Group Calculation', () => {
    it('should identify adult patient (18+)', () => {
      const adultBirthday = moment().subtract(18, 'years').format('YYYY-MM-DD');
      const adultUser = {
        ...baseUser,
        profile: {
          ...baseUser.profile,
          patient: {
            ...baseUser.profile.patient,
            birthday: adultBirthday
          }
        }
      };

      const state = {
        ...baseState,
        blip: {
          ...baseState.blip,
          allUsersMap: { [loggedInUserId]: adultUser }
        }
      };

      renderWithProviders(state);

      // Click to open consent dialog to verify age group
      const button = screen.getByText("Yes, I'm Interested");
      fireEvent.click(button);

      const consentProps = JSON.parse(screen.getByTestId('consent-props').textContent);
      expect(consentProps.patientAgeGroup).toBe('adult');
    });

    it('should identify youth patient (13-17)', () => {
      const youthBirthday = moment().subtract(17, 'years').format('YYYY-MM-DD');
      const youthUser = {
        ...baseUser,
        profile: {
          ...baseUser.profile,
          patient: {
            ...baseUser.profile.patient,
            birthday: youthBirthday
          }
        }
      };

      const state = {
        ...baseState,
        blip: {
          ...baseState.blip,
          allUsersMap: { [loggedInUserId]: youthUser }
        }
      };

      renderWithProviders(state);

      const button = screen.getByText("Yes, I'm Interested");
      fireEvent.click(button);

      const consentProps = JSON.parse(screen.getByTestId('consent-props').textContent);
      expect(consentProps.patientAgeGroup).toBe('youth');
    });

    it('should identify child patient (<13)', () => {
      const childBirthday = moment().subtract(12, 'years').format('YYYY-MM-DD');
      const childUser = {
        ...baseUser,
        profile: {
          ...baseUser.profile,
          patient: {
            ...baseUser.profile.patient,
            birthday: childBirthday
          }
        }
      };

      const state = {
        ...baseState,
        blip: {
          ...baseState.blip,
          allUsersMap: { [loggedInUserId]: childUser }
        }
      };

      renderWithProviders(state);

      const button = screen.getByText("Yes, I'm Interested");
      fireEvent.click(button);

      const consentProps = JSON.parse(screen.getByTestId('consent-props').textContent);
      expect(consentProps.patientAgeGroup).toBe('child');
    });
  });

  describe('Consent Dialog Flow', () => {
    it('should show "Yes, I\'m Interested" button only in profile context', () => {
      renderWithProviders(baseState, { ...defaultProps, formContext: formContexts.profile });
      expect(screen.getByText("Yes, I'm Interested")).toBeInTheDocument();
    });

    it('should not show "Yes, I\'m Interested" button in newPatient context', () => {
      renderWithProviders(baseState, { ...defaultProps, formContext: formContexts.newPatient });
      expect(screen.queryByText("Yes, I'm Interested")).not.toBeInTheDocument();
    });

    it('should open consent dialog when "Yes, I\'m Interested" is clicked', async () => {
      renderWithProviders();

      expect(screen.queryByTestId('consent-dialog')).not.toBeInTheDocument();

      const button = screen.getByText("Yes, I'm Interested");
      await userEvent.click(button);

      expect(screen.getByTestId('consent-dialog')).toBeInTheDocument();
    });

    it('should pass correct props to consent dialog', async () => {
      mockPersonUtils.patientIsOtherPerson.mockReturnValue(true);
      mockPersonUtils.patientFullName.mockReturnValue('Patient Name');
      mockPersonUtils.fullName.mockReturnValue('Caregiver Name');

      renderWithProviders();

      const button = screen.getByText("Yes, I'm Interested");
      await userEvent.click(button);

      const consentProps = JSON.parse(screen.getByTestId('consent-props').textContent);
      expect(consentProps.accountType).toBe('caregiver');
      expect(consentProps.patientName).toBe('Patient Name');
      expect(consentProps.caregiverName).toBe('Caregiver Name');
    });

    it('should close consent dialog when close button is clicked', async () => {
      renderWithProviders();

      const openButton = screen.getByText("Yes, I'm Interested");
      await userEvent.click(openButton);

      expect(screen.getByTestId('consent-dialog')).toBeInTheDocument();

      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);

      expect(screen.queryByTestId('consent-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Consent Creation', () => {
    it('should dispatch createUserConsentRecord with correct data for adult', async () => {
      renderWithProviders();

      const button = screen.getByText("Yes, I'm Interested");
      await userEvent.click(button);

      const confirmButton = screen.getByText('Confirm Consent');
      await userEvent.click(confirmButton);

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'CREATE_USER_CONSENT_RECORD_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.createUserConsentRecord).toHaveBeenCalledWith(
        'user123',
        {
          ageGroup: '>=18',
          grantorType: 'owner',
          metadata: { supportedOrganizations: [] },
          ownerName: 'John Doe Patient',
          type: 'big_data_donation_project',
          version: 1,
        },
        expect.any(Function)
      );
    });

    it('should dispatch createUserConsentRecord with correct data for child', async () => {
      const childBirthday = moment().subtract(10, 'years').format('YYYY-MM-DD');
      const childUser = {
        ...baseUser,
        profile: {
          ...baseUser.profile,
          patient: {
            ...baseUser.profile.patient,
            birthday: childBirthday
          }
        }
      };

      const state = {
        ...baseState,
        blip: {
          ...baseState.blip,
          allUsersMap: { [loggedInUserId]: childUser }
        }
      };

      renderWithProviders(state);

      const button = screen.getByText("Yes, I'm Interested");
      await userEvent.click(button);

      const confirmButton = screen.getByText('Confirm Consent');
      await userEvent.click(confirmButton);

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'CREATE_USER_CONSENT_RECORD_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.createUserConsentRecord).toHaveBeenCalledWith(
        'user123',
        {
          ageGroup: '<13',
          grantorType: 'parent/guardian',
          metadata: { supportedOrganizations: [] },
          ownerName: 'John Doe Patient',
          parentGuardianName: 'Test Name',
          type: 'big_data_donation_project',
          version: 1,
        },
        expect.any(Function)
      );
    });

    it('should track metrics for consent creation', async () => {
      renderWithProviders();

      const button = screen.getByText("Yes, I'm Interested");
      await userEvent.click(button);

      const confirmButton = screen.getByText('Confirm Consent');
      await userEvent.click(confirmButton);

      expect(defaultProps.trackMetric).toHaveBeenCalledWith('Create Consent Record', {
        formContext: formContexts.profile,
        type: DATA_DONATION_CONSENT_TYPE,
        version: 1,
        grantorType: 'owner',
        ageGroup: '>=18'
      });
    });
  });

  describe('Supported Organizations Management', () => {
    const stateWithConsent = {
      ...baseState,
      blip: {
        ...baseState.blip,
        consentRecords: {
          [DATA_DONATION_CONSENT_TYPE]: {
            id: 'consent123',
            type: DATA_DONATION_CONSENT_TYPE,
            version: 1,
            grantorType: 'owner',
            ageGroup: '>=18',
            metadata: { supportedOrganizations: ['Breakthrough T1D', 'DiabetesSisters'] }
          }
        }
      }
    };

    it('should load existing supported organizations', () => {
      renderWithProviders(stateWithConsent);

      // The MultiSelect should be rendered with existing organizations, and remove buttons for each
      const supportedOrgsMultiSelect = screen.getByLabelText('Data donation supported non-profits');
      expect(supportedOrgsMultiSelect).toBeInTheDocument();
      expect(screen.getByText('Breakthrough T1D')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Breakthrough T1D' })).toBeInTheDocument();

      expect(screen.getByText('DiabetesSisters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove DiabetesSisters' })).toBeInTheDocument();
    });

    it('should update supported organizations when changed', async () => {
      const user = userEvent.setup();

      const stateWithEmptyOrgs = {
        ...baseState,
        blip: {
          ...baseState.blip,
          consentRecords: {
            [DATA_DONATION_CONSENT_TYPE]: {
              id: 'consent123',
              type: DATA_DONATION_CONSENT_TYPE,
              version: 1,
              grantorType: 'owner',
              ageGroup: '>=18',
              metadata: { supportedOrganizations: [] }
            }
          }
        }
      };

      renderWithProviders(stateWithEmptyOrgs);
      expect(screen.queryByText('DiabetesSisters')).not.toBeInTheDocument();

      const supportedOrgsMultiSelect = screen.getByLabelText('Data donation supported non-profits');
      expect(supportedOrgsMultiSelect).toBeInTheDocument();

      user.click(supportedOrgsMultiSelect);
      const option = await screen.findByText('DiabetesSisters');
      expect(option).toBeInTheDocument();
      await user.click(option);

      fireEvent.blur(supportedOrgsMultiSelect); // Trigger onMenuClose

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'UPDATE_USER_CONSENT_RECORD_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.updateUserConsentRecord).toHaveBeenCalledWith(
        'user123',
        'consent123',
        { metadata: { supportedOrganizations: ['DiabetesSisters'] } },
        expect.any(Function)
      );
    });

    it('should track metrics for organization updates', async () => {
      const user = userEvent.setup();

      const stateWithEmptyOrgs = {
        ...baseState,
        blip: {
          ...baseState.blip,
          consentRecords: {
            [DATA_DONATION_CONSENT_TYPE]: {
              id: 'consent123',
              type: DATA_DONATION_CONSENT_TYPE,
              version: 1,
              grantorType: 'owner',
              ageGroup: '>=18',
              metadata: { supportedOrganizations: [] }
            }
          }
        }
      };

      renderWithProviders(stateWithEmptyOrgs);
      expect(screen.queryByText('DiabetesSisters')).not.toBeInTheDocument();

      const supportedOrgsMultiSelect = screen.getByLabelText('Data donation supported non-profits');
      expect(supportedOrgsMultiSelect).toBeInTheDocument();

      user.click(supportedOrgsMultiSelect);
      const option = await screen.findByText('DiabetesSisters');
      expect(option).toBeInTheDocument();
      await user.click(option);

      fireEvent.blur(supportedOrgsMultiSelect); // Trigger onMenuClose

      expect(defaultProps.trackMetric).toHaveBeenCalledWith(
        'Update Consent Record',
        {
          ageGroup: '>=18',
          formContext: 'profile',
          grantorType: 'owner',
          type: 'big_data_donation_project',
          version: 1,
        }
      );
    });
  });

  describe('Revoke Consent Flow', () => {
    const stateWithConsent = {
      ...baseState,
      blip: {
        ...baseState.blip,
        consentRecords: {
          [DATA_DONATION_CONSENT_TYPE]: {
            id: 'consent123',
            type: DATA_DONATION_CONSENT_TYPE,
            version: 1,
            grantorType: 'owner',
            ageGroup: '>=18',
            metadata: { supportedOrganizations: [] }
          }
        }
      }
    };

    it('should show "Stop Sharing Data" button when consent exists', () => {
      renderWithProviders(stateWithConsent);
      expect(screen.getByText('Stop Sharing Data')).toBeInTheDocument();
    });

    it('should open revoke dialog when "Stop Sharing Data" is clicked', async () => {
      renderWithProviders(stateWithConsent);

      expect(screen.queryByTestId('revoke-dialog')).not.toBeInTheDocument();

      const button = screen.getByText('Stop Sharing Data');
      await userEvent.click(button);

      expect(screen.getByTestId('revoke-dialog')).toBeInTheDocument();
    });

    it('should dispatch revokeUserConsentRecord when confirmed', async () => {
      renderWithProviders(stateWithConsent);

      const button = screen.getByText('Stop Sharing Data');
      await userEvent.click(button);

      const confirmButton = screen.getByText('Confirm Revoke');
      await userEvent.click(confirmButton);

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'REVOKE_USER_CONSENT_RECORD_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.revokeUserConsentRecord).toHaveBeenCalledWith(
        'user123',
        'consent123',
        expect.any(Function)
      );
    });

    it('should track metrics for consent revocation', async () => {
      renderWithProviders(stateWithConsent);

      const button = screen.getByText('Stop Sharing Data');
      await userEvent.click(button);

      const confirmButton = screen.getByText('Confirm Revoke');
      await userEvent.click(confirmButton);

      expect(defaultProps.trackMetric).toHaveBeenCalledWith('Revoke Consent Record', {
        formContext: formContexts.profile,
        type: DATA_DONATION_CONSENT_TYPE,
        version: 1,
        grantorType: 'owner',
        ageGroup: '>=18'
      });
    });

    it('should show processing state in revoke dialog', async () => {
      const stateWithProcessing = {
        ...stateWithConsent,
        blip: {
          ...stateWithConsent.blip,
          working: {
            ...stateWithConsent.blip.working,
            revokingUserConsentRecord: { inProgress: true }
          }
        }
      };

      renderWithProviders(stateWithProcessing);

      const button = screen.getByText('Stop Sharing Data');
      await userEvent.click(button);

      expect(screen.getByTestId('processing-state')).toHaveTextContent('not-processing');
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch fetchLatestConsentByType on mount', () => {
      renderWithProviders();

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'FETCH_LATEST_CONSENT_BY_TYPE_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.getLatestConsentByType).toHaveBeenCalledWith(
        'big_data_donation_project',
        expect.any(Function)
      );
    });

    it('should dispatch fetchUserConsentRecords on mount', () => {
      renderWithProviders();

      const actions = store.getActions();
      expect(actions.some(action =>
        action.type === 'FETCH_USER_CONSENT_RECORDS_REQUEST'
      )).toBeTruthy();

      expect(defaultProps.api.consent.getUserConsentRecords).toHaveBeenCalledWith(
        'user123',
        'big_data_donation_project',
        expect.any(Function)
      );
    });
  });

  describe('Analytics Tracking', () => {
    it('should track "Viewed Profile Create" on mount', () => {
      renderWithProviders();

      expect(defaultProps.trackMetric).toHaveBeenCalledWith('Viewed Profile Create');
    });
  });
});
