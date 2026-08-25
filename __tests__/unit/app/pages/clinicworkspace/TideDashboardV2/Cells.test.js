import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import {
  PatientCell,
  NumericTemplateCell,
  AvgGlucoseCell,
  TimeInRangePercentBarChartCell,
  TimeInTargetPercentCell,
  TimeInVeryLowPercentCell,
  TimeInAnyLowPercentCell,
  TimeInVeryHighPercentCell,
  TimeInAnyHighPercentCell,
  ChangeTIRCell,
  GMICell,
  CGMUseCell,
  MoreMenuCell,
} from '@app/pages/clinicworkspace/TideDashboardV2/Cells';

const mockStore = configureStore([thunk]);

const patient = {
  id: 'patient-1',
  fullName: 'James Jellyfish',
  birthDate: '2010-10-10',
  mrn: 'mrn-123',
  summary: {
    cgmStats: {
      config: {
        lowGlucoseThreshold: 3.9,
        highGlucoseThreshold: 10,
      },
      periods: {
        '14d': {
          averageGlucoseMmol: 8.26,
          glucoseManagementIndicator: 7.2,
          timeInVeryLowPercent: 0.0134,
          timeInLowPercent: 0.0434,
          timeInAnyLowPercent: 0.0568,
          timeInTargetPercent: 0.6712,
          timeInTargetPercentDelta: -0.1523,
          timeInHighPercent: 0.2011,
          timeInAnyHighPercent: 0.2733,
          timeInVeryHighPercent: 0.0722,
          timeCGMUsePercent: 0.9312,
          timeCGMUseMinutes: 18780,
        },
      },
    },
  },
};

describe('Cells', () => {
  let store;

  const renderComponent = (cell) => {
    render(<Provider store={store}>{cell}</Provider>);
  };

  beforeEach(() => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { id: 'clinic123', preferredBgUnits: 'mg/dL' } },
        tideDashboardFilters: { summaryPeriod: '14d' },
      },
    });
  });

  describe('PatientCell', () => {
    it('renders the patient name, date of birth and MRN', () => {
      renderComponent(<PatientCell patient={patient} />);

      expect(screen.getByText('James Jellyfish')).toBeInTheDocument();
      expect(screen.getByText('DOB: 2010-10-10')).toBeInTheDocument();
      expect(screen.getByText('MRN: mrn-123')).toBeInTheDocument();
    });
  });

  describe('AvgGlucoseCell', () => {
    it('renders the average glucose of the active summary period to one decimal place', () => {
      renderComponent(<AvgGlucoseCell patient={patient} />);

      expect(screen.getByText('8.3')).toBeInTheDocument(); // averageGlucoseMmol 8.26
    });
  });

  describe('TimeInRangePercentBarChartCell', () => {
    it('renders a bar summary of the time spent in each range', () => {
      renderComponent(<TimeInRangePercentBarChartCell patient={patient} />);

      // Ranges are labelled using the patient's glucose thresholds, in the clinic's preferred units
      expect(screen.getByText('<54')).toBeInTheDocument();
      expect(screen.getByText('54-69')).toBeInTheDocument();
      expect(screen.getByText('70-180')).toBeInTheDocument();  // lowGlucoseThreshold 3.9, highGlucoseThreshold 10
      expect(screen.getByText('181-250')).toBeInTheDocument();
      expect(screen.getByText('>250')).toBeInTheDocument();
      expect(screen.getByText('Units in mg/dL')).toBeInTheDocument();

      expect(screen.getByText('1')).toBeInTheDocument();  // timeInVeryLowPercent 0.0134
      expect(screen.getByText('4')).toBeInTheDocument();  // timeInLowPercent 0.0434
      expect(screen.getByText('67')).toBeInTheDocument(); // timeInTargetPercent 0.6712
      expect(screen.getByText('21')).toBeInTheDocument(); // timeInHighPercent 0.2011
      expect(screen.getByText('7')).toBeInTheDocument();  // timeInVeryHighPercent 0.0722

      expect(screen.getByText('93 %')).toBeInTheDocument(); // timeCGMUsePercent 0.9312
    });
  });

  describe('TimeInTargetPercentCell', () => {
    it('renders the time in target as a whole percentage', () => {
      renderComponent(<TimeInTargetPercentCell patient={patient} />);

      expect(screen.getByText('67 %')).toBeInTheDocument(); // timeInTargetPercent 0.6712
    });
  });

  describe('TimeInVeryLowPercentCell', () => {
    it('renders the time in very low as a whole percentage', () => {
      renderComponent(<TimeInVeryLowPercentCell patient={patient} />);

      expect(screen.getByText('1 %')).toBeInTheDocument(); // timeInVeryLowPercent 0.0134
    });
  });

  describe('TimeInAnyLowPercentCell', () => {
    it('renders the time in any low as a whole percentage', () => {
      renderComponent(<TimeInAnyLowPercentCell patient={patient} />);

      expect(screen.getByText('6 %')).toBeInTheDocument(); // timeInAnyLowPercent 0.0568
    });
  });

  describe('TimeInVeryHighPercentCell', () => {
    it('renders the time in very high as a whole percentage', () => {
      renderComponent(<TimeInVeryHighPercentCell patient={patient} />);

      expect(screen.getByText('7 %')).toBeInTheDocument(); // timeInVeryHighPercent 0.0722
    });
  });

  describe('TimeInAnyHighPercentCell', () => {
    it('renders the time in any high as a whole percentage', () => {
      renderComponent(<TimeInAnyHighPercentCell patient={patient} />);

      expect(screen.getByText('27 %')).toBeInTheDocument(); // timeInAnyHighPercent 0.2733
    });
  });

  describe('ChangeTIRCell', () => {
    it('renders the change in time in range as a bar and as a percentage', () => {
      renderComponent(<ChangeTIRCell patient={patient} />);

      expect(screen.getByText('-15.2 %')).toBeInTheDocument(); // compact layout value
    });
  });

  describe('GMICell', () => {
    it('renders the glucose management indicator as a percentage', () => {
      renderComponent(<GMICell patient={patient} />);

      expect(screen.getByText('7.2 %')).toBeInTheDocument();
    });
  });

  describe('CGMUseCell', () => {
    it('renders the CGM use as a whole percentage', () => {
      renderComponent(<CGMUseCell patient={patient} />);

      expect(screen.getByText('93 %')).toBeInTheDocument(); // timeCGMUsePercent 0.9312
    });
  });
});
