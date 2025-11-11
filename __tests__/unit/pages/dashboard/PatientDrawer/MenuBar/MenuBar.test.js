/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { I18nextProvider } from 'react-i18next';

import MenuBar, { OVERVIEW_TAB_INDEX, STACKED_DAILY_TAB_INDEX } from '@app/pages/dashboard/PatientDrawer/MenuBar/MenuBar';
import i18n from '@app/core/language';

// Mock LaunchDarkly
jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(() => ({
    showTideDashboardLastReviewed: false,
  })),
}));

// Mock actions
jest.mock('@app/redux/actions', () => ({
  async: {
    fetchPatientFromClinic: jest.fn(() => ({ type: 'MOCK_FETCH_PATIENT' })),
  },
}));

// Mock connected-react-router
jest.mock('connected-react-router', () => ({
  push: jest.fn(),
}));

// Mock api
jest.mock('@app/core/api', () => ({}));

// Mock PatientLastReviewed component
jest.mock('@app/components/clinic/PatientLastReviewed', () => {
  return function MockPatientLastReviewed(props) {
    return <div data-testid="patient-last-reviewed">Last Reviewed Component</div>;
  };
});

// Mock the agpCGMText function from @tidepool/viz while preserving other exports
jest.mock('@tidepool/viz', () => {
  const originalModule = jest.requireActual('@tidepool/viz');
  return {
    ...originalModule,
    utils: {
      ...originalModule.utils,
      text: {
        ...originalModule.utils.text,
        agpCGMText: jest.fn(() => 'Mocked AGP CGM text content'),
      },
    },
  };
});

const mockStore = configureStore([thunk]);

const defaultProps = {
  patientId: 'patient123',
  onClose: jest.fn(),
  onSelectTab: jest.fn(),
  selectedTab: OVERVIEW_TAB_INDEX,
  trackMetric: jest.fn(),
};

const defaultPatient = {
  fullName: 'John Doe',
  birthDate: '1990-01-15',
};

const defaultState = {
  blip: {
    selectedClinicId: 'clinic123',
    clinics: {
      clinic123: {
        patients: {
          patient123: defaultPatient,
        },
      },
    },
    pdf: {
      data: {
        agpCGM: {
          data: {
            current: {
              stats: {
                sensorUsage: {
                  count: 300, // 300 * 5 minutes = 1500 minutes = 25 hours (enough for 24h requirement)
                  sampleInterval: 5 * 60 * 1000, // 5 minutes in ms
                },
              },
            },
          },
        },
      },
    },
  },
};

const renderMenuBar = (props = {}, state = defaultState, flags = {}) => {
  const store = mockStore(state);

  // Mock useFlags
  require('launchdarkly-react-client-sdk').useFlags.mockReturnValue({
    showTideDashboardLastReviewed: false,
    ...flags,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <MenuBar {...defaultProps} {...props} />
        </I18nextProvider>
      </MemoryRouter>
    </Provider>
  );
};

describe('MenuBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Patient Information Display', () => {
    it('should display patient name when patient data is available', () => {
      renderMenuBar();

      expect(screen.getByTestId('patient-name')).toHaveTextContent('John Doe');
    });

    it('should display patient birthdate when patient data is available', () => {
      renderMenuBar();

      expect(screen.getByTestId('patient-birthdate')).toHaveTextContent('DOB: 1990-01-15');
    });

    it('should handle missing patient birthdate gracefully', () => {
      const stateWithoutBirthdate = {
        ...defaultState,
        blip: {
          ...defaultState.blip,
          clinics: {
            clinic123: {
              patients: {
                patient123: {
                  fullName: 'John Doe',
                },
              },
            },
          },
        },
      };

      renderMenuBar({}, stateWithoutBirthdate);

      expect(screen.getByTestId('patient-name')).toHaveTextContent('John Doe');
      expect(screen.queryByTestId('patient-birthdate')).not.toBeInTheDocument();
    });
  });

  describe('Last Reviewed Component', () => {
    it('should display last reviewed section when feature flag is enabled', () => {
      renderMenuBar({}, defaultState, { showTideDashboardLastReviewed: true });

      expect(screen.getByTestId('last-reviewed-section')).toBeInTheDocument();
      expect(screen.getByTestId('patient-last-reviewed')).toBeInTheDocument();
      expect(screen.getByText('Last Reviewed')).toBeInTheDocument();
    });

    it('should not display last reviewed section when feature flag is disabled', () => {
      renderMenuBar({}, defaultState, { showTideDashboardLastReviewed: false });

      expect(screen.queryByTestId('last-reviewed-section')).not.toBeInTheDocument();
      expect(screen.queryByTestId('patient-last-reviewed')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should render both overview and stacked daily tabs', () => {
      renderMenuBar();

      expect(screen.getByTestId('tab-overview')).toHaveTextContent('Overview');
      expect(screen.getByTestId('tab-stackedDaily')).toHaveTextContent('Stacked Daily View');
    });

    it('should show overview tab as selected by default', () => {
      renderMenuBar({ selectedTab: OVERVIEW_TAB_INDEX });

      const overviewTab = screen.getByTestId('tab-overview');
      const stackedDailyTab = screen.getByTestId('tab-stackedDaily');

      expect(overviewTab).toBeInTheDocument();
      expect(overviewTab).toHaveClass('selected');
      expect(stackedDailyTab).toBeInTheDocument();
      expect(stackedDailyTab).not.toHaveClass('selected');
    });

    it('should show stacked daily tab as selected when specified', () => {
      renderMenuBar({ selectedTab: STACKED_DAILY_TAB_INDEX });

      const overviewTab = screen.getByTestId('tab-overview');
      const stackedDailyTab = screen.getByTestId('tab-stackedDaily');

      expect(overviewTab).toBeInTheDocument();
      expect(overviewTab).not.toHaveClass('selected');
      expect(stackedDailyTab).toBeInTheDocument();
      expect(stackedDailyTab).toHaveClass('selected');
    });

    it('calls onSelectTab and trackMetric when a tab is clicked', () => {
      const mockOnSelectTab = jest.fn();
      const mockTrackMetric = jest.fn();

      renderMenuBar({
        onSelectTab: mockOnSelectTab,
        trackMetric: mockTrackMetric
      });

      fireEvent.click(screen.getByTestId('tab-stackedDaily'));

      expect(mockOnSelectTab).toHaveBeenCalledWith('1'); // String key, not numeric index
      expect(mockTrackMetric).toHaveBeenCalledWith(
        'TIDE Dashboard - clicked stacked daily view',
        { clinicId: 'clinic123' }
      );
    });
  });

  describe('View Data Button', () => {
    it('should render view data button', () => {
      renderMenuBar();

      const viewDataButton = screen.getByTestId('view-data-button');
      expect(viewDataButton).toBeInTheDocument();
      expect(viewDataButton).toHaveTextContent('View Data');
    });

    it('should render view data button and handle clicks without errors', async () => {
      const user = userEvent.setup();
      const { push } = require('connected-react-router');

      // Mock push to return a plain object instead of a thunk
      push.mockReturnValue({ type: 'MOCK_PUSH', payload: '/some/path' });

      renderMenuBar({ selectedTab: OVERVIEW_TAB_INDEX });

      const viewDataButton = screen.getByTestId('view-data-button');
      expect(viewDataButton).toBeInTheDocument();
      expect(viewDataButton).toHaveTextContent('View Data');

      // Click the view data button
      await user.click(viewDataButton);

      // Verify push was called with correct navigation URL
      expect(push).toHaveBeenCalledWith(
        `/patients/patient123/data/trends?dashboard=tide&drawerTab=${OVERVIEW_TAB_INDEX}`
      );
    });

    it('should navigate to correct URL when view data button is clicked with stacked daily tab selected', async () => {
      const user = userEvent.setup();
      const { push } = require('connected-react-router');

      // Mock push to return a plain object instead of a thunk
      push.mockReturnValue({ type: 'MOCK_PUSH', payload: '/some/path' });

      renderMenuBar({ selectedTab: STACKED_DAILY_TAB_INDEX });

      const viewDataButton = screen.getByTestId('view-data-button');
      await user.click(viewDataButton);

      // Verify push was called with stacked daily tab index
      expect(push).toHaveBeenCalledWith(
        `/patients/patient123/data/trends?dashboard=tide&drawerTab=${STACKED_DAILY_TAB_INDEX}`
      );
    });
  });

  describe('CGM Clipboard Button', () => {
    it('should render CGM clipboard button', () => {
      renderMenuBar();

      expect(screen.getByTestId('cgm-clipboard-button')).toBeInTheDocument();
    });

    it('should be enabled when CGM data is available', () => {
      renderMenuBar();

      const cgmButton = screen.getByTestId('cgm-clipboard-button');
      expect(cgmButton).toBeEnabled();
    });

    it('should be disabled when CGM data is not available', () => {
      const stateWithoutCGMData = {
        ...defaultState,
        blip: {
          ...defaultState.blip,
          pdf: {
            data: {},
          },
        },
      };

      renderMenuBar({}, stateWithoutCGMData);

      const cgmButton = screen.getByTestId('cgm-clipboard-button');
      expect(cgmButton).toBeDisabled();
    });

    it('should be disabled when sensor usage data is insufficient', () => {
      const stateWithInsufficientData = {
        ...defaultState,
        blip: {
          ...defaultState.blip,
          pdf: {
            data: {
              agpCGM: {
                data: {
                  current: {
                    stats: {
                      sensorUsage: {
                        count: 100, // 100 * 5 minutes = 500 minutes = 8.33 hours (less than 24h requirement)
                        sampleInterval: 5 * 60 * 1000,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      renderMenuBar({}, stateWithInsufficientData);

      const cgmButton = screen.getByTestId('cgm-clipboard-button');
      expect(cgmButton).toBeDisabled();
    });
  });
});
