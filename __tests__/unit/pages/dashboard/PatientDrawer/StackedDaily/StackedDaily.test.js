/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import StackedDaily from '@app/pages/dashboard/PatientDrawer/StackedDaily';
import { STATUS } from '@app/pages/dashboard/PatientDrawer/useAgpCGM';
import { mean } from 'lodash';
import { MS_IN_DAY } from '../../../../../../app/core/constants';

// Mock connected-react-router
jest.mock('connected-react-router', () => ({
  push: jest.fn(),
}));

// Mock tideline chart factory
jest.mock('tideline/plugins/blip', () => ({
  oneday: jest.fn(() => ({
    setupPools: jest.fn(() => ({
      load: jest.fn(() => ({
        locate: jest.fn(),
      })),
    })),
  })),
}));

const mockLocalizedCeiling = new Date('2024-01-01').valueOf();

// Mock the @tidepool/viz components while preserving other exports
jest.mock('@tidepool/viz', () => {
  const originalModule = jest.requireActual('@tidepool/viz');
  return {
    ...originalModule,
    components: {
      Loader: function MockLoader({ show }) {
        return show ? <div data-testid="loader">Loading...</div> : null;
      },
      SMBGTooltip: function MockSMBGTooltip(props) {
        return <div data-testid="smbg-tooltip">SMBG Tooltip</div>;
      },
      CBGTooltip: function MockCBGTooltip(props) {
        return <div data-testid="cbg-tooltip">CBG Tooltip</div>;
      },
    },
    utils: {
      ...originalModule.utils,
      getLocalizedCeiling: jest.fn(val => mockLocalizedCeiling),
    }
  };
});

// Mock Overview components
jest.mock('@app/pages/dashboard/PatientDrawer/Overview', () => ({
  NoPatientData: function MockNoPatientData({ patientName }) {
    return <div data-testid="no-patient-data">No data for {patientName}</div>;
  },
  InsufficientData: function MockInsufficientData() {
    return <div data-testid="insufficient-data">Insufficient data</div>;
  },
}));

// Mock BgLegend component
jest.mock('@app/components/chart/BgLegend', () => {
  return function MockBgLegend() {
    return <div data-testid="bg-legend-component">BG Legend</div>;
  };
});

const mockStore = configureStore([thunk]);

const defaultProps = {
  patientId: 'patient123',
  agpCGMData: {
    status: STATUS.DATA_PROCESSED,
    agpCGM: {
      data: {
        current: {
          aggregationsByDate: {
            dataByDate: {
              '2024-01-01': { cbg: [{ value: 120 }], smbg: [{ value: 110 }] },
              '2024-01-02': { cbg: [{ value: 130 }], smbg: [{ value: 115 }] },
              '2024-01-03': { cbg: [{ value: 125 }], smbg: [{ value: 120 }] },
            }
          },
          data: {
            fill: [1, 2, 3, 4, 5, 6, 7, 8],
          }
        }
      },
      query: {
        bgPrefs: {
          bgClasses: { low: 70, target: 180, high: 250 },
          bgUnits: 'mg/dL'
        }
      },
      timePrefs: { timezoneAware: false }
    }
  }
};

const defaultState = {
  blip: {
    selectedClinicId: 'clinic123',
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

const renderComponent = (props = {}, storeState = {}) => {
  const store = mockStore({ ...defaultState, ...storeState });
  const finalProps = { ...defaultProps, ...props };

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <StackedDaily {...finalProps} />
      </MemoryRouter>
    </Provider>
  );
};

describe('StackedDaily Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Handling', () => {
    it('should render NoPatientData component when status is NO_PATIENT_DATA', () => {
      renderComponent({
        agpCGMData: {
          status: STATUS.NO_PATIENT_DATA,
        }
      });

      expect(screen.getByTestId('no-patient-data')).toBeInTheDocument();
      expect(screen.getByText('No data for John Doe')).toBeInTheDocument();
    });

    it('should render InsufficientData component when status is INSUFFICIENT_DATA', () => {
      renderComponent({
        agpCGMData: {
          status: STATUS.INSUFFICIENT_DATA,
        }
      });

      expect(screen.getByTestId('insufficient-data')).toBeInTheDocument();
    });

    it('should render Loader component when status is not processed', () => {
      renderComponent({
        agpCGMData: {
          status: 'PROCESSING',
        }
      });

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should render chart content when status is DATA_PROCESSED', () => {
      renderComponent();

      expect(screen.getByTestId('stacked-daily-container')).toBeInTheDocument();
      expect(screen.getByTestId('glucose-units-label')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display glucose units label with correct units', () => {
      renderComponent();

      expect(screen.getByTestId('glucose-units-label')).toHaveTextContent('Glucose (mg/dL)');
    });

    it('should render BG legend component', () => {
      renderComponent();

      expect(screen.getByTestId('bg-legend')).toBeInTheDocument();
      expect(screen.getByTestId('bg-legend-component')).toBeInTheDocument();
    });

    it('should render chart date headers for each day in data', () => {
      renderComponent();

      const dateHeaders = screen.getAllByTestId('chart-date-header');
      expect(dateHeaders).toHaveLength(3);
      expect(screen.getByText('Mon, Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Tue, Jan 2, 2024')).toBeInTheDocument();
      expect(screen.getByText('Wed, Jan 3, 2024')).toBeInTheDocument();
    });

    it('should render chart containers for each day', () => {
      renderComponent();

      const chartContainers = screen.getAllByTestId('chart-container');
      expect(chartContainers).toHaveLength(3);
    });
  });

  describe('View More Functionality', () => {
    const manyDaysData = {
      agpCGMData: {
        ...defaultProps.agpCGMData,
        agpCGM: {
          ...defaultProps.agpCGMData.agpCGM,
          data: {
            ...defaultProps.agpCGMData.agpCGM.data,
            current: {
              ...defaultProps.agpCGMData.agpCGM.data.current,
              aggregationsByDate: {
                dataByDate: Array.from({ length: 15 }, (_, i) => [
                  `2024-01-${String(i + 1).padStart(2, '0')}`,
                  { cbg: [{ value: 120 + i }], smbg: [{ value: 110 + i }] }
                ]).reduce((acc, [date, data]) => ({ ...acc, [date]: data }), {})
              }
            }
          }
        }
      }
    };

    it('should show correct day count text when showing partial days', () => {
      renderComponent(manyDaysData);

      expect(screen.getByTestId('day-count-text')).toHaveTextContent('Showing 7 of 15 days');
    });

    it('should show view more button when there are more than 7 days', () => {
      renderComponent(manyDaysData);

      expect(screen.getByTestId('view-more-button')).toBeInTheDocument();
    });

    it('should not show view more button when all days are visible', () => {
      renderComponent(); // Only 3 days

      expect(screen.queryByTestId('view-more-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('day-count-text')).toHaveTextContent('Showing all 3 days');
    });

    it('should increase visible days when view more button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent(manyDaysData);

      // Initially shows 7 days
      expect(screen.getByTestId('day-count-text')).toHaveTextContent('Showing 7 of 15 days');

      // Click view more
      await user.click(screen.getByTestId('view-more-button'));

      // Should now show 14 days (7 + 7)
      expect(screen.getByTestId('day-count-text')).toHaveTextContent('Showing 14 of 15 days');
    });
  });

  describe('Navigation and Interaction', () => {
    it('should always render back to top button', () => {
      renderComponent();

      expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();
    });

    it('should handle back to top button click', async () => {
      const user = userEvent.setup();
      const scrollIntoViewMock = jest.fn();

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      renderComponent();

      await user.click(screen.getByTestId('back-to-top-button'));

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('should handle date header clicks for navigation', async () => {
      const user = userEvent.setup();
      const { push } = require('connected-react-router');

      // Mock push to return a plain object instead of a thunk
      push.mockReturnValue({ type: 'MOCK_PUSH', payload: '/some/path' });

      renderComponent();

      const dateHeader = screen.getByText('Mon, Jan 1, 2024');
      await user.click(dateHeader);
      const expectedDatetime = mean([mockLocalizedCeiling, mockLocalizedCeiling + MS_IN_DAY]); // should be set to the middle of the day

      expect(push).toHaveBeenCalled();
      const pushCall = push.mock.calls[0][0];
      expect(pushCall).toContain(`/patients/patient123/data/daily?dashboard=tide&drawerTab=1&datetime=${expectedDatetime}`);
    });
  });
});
