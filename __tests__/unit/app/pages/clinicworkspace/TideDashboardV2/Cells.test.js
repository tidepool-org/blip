import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import cloneDeep from 'lodash/cloneDeep';

import { CATEGORY } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';
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
  FlagCell,
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

      expect(screen.getByText('149')).toBeInTheDocument(); // averageGlucoseMmol 8.26
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

  describe('FlagCell', () => {
    // Patient whose summary stats sit within every flag threshold, so no flag applies
    const meetingTargetsPatient = {
      summary: {
        cgmStats: {
          periods: {
            '14d': {
              timeInVeryLowPercent: 0.004,
              timeInAnyLowPercent: 0.03,
              timeInTargetPercentDelta: -0.05,
              timeInAnyHighPercent: 0.2,
              timeInVeryHighPercent: 0.04,
              timeCGMUsePercent: 0.85,
            },
          },
        },
      },
    };

    const ui = (props) => <Provider store={store}><FlagCell {...props} /></Provider>;

    it('flags the highest-priority range whose threshold the summary meets', () => {
      let patient;

      // No flag when the summary is within every threshold
      patient = cloneDeep(meetingTargetsPatient);
      const { container, rerender } = render(ui({ patient }));
      expect(container).toBeEmptyDOMElement();

      // Time in very low at or above 1% flags Very Low
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInVeryLowPercent = 0.0134;
      rerender(ui({ patient }));
      expect(screen.getByText('Very Low')).toBeInTheDocument();

      // Time in any low at or above 4% flags Low
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInAnyLowPercent = 0.0568;
      rerender(ui({ patient }));
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.queryByText('Very Low')).not.toBeInTheDocument();

      // Drop in time in target at or below -15% flags Drop in TIR
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInTargetPercentDelta = -0.1523;
      rerender(ui({ patient }));
      expect(screen.getByText('Drop in TIR')).toBeInTheDocument();

      // Time in any high at or above 25% flags High
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInAnyHighPercent = 0.2733;
      rerender(ui({ patient }));
      expect(screen.getByText('High')).toBeInTheDocument();

      // Time in very high at or above 5% flags Very High
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInVeryHighPercent = 0.0722;
      rerender(ui({ patient }));
      expect(screen.getByText('Very High')).toBeInTheDocument();

      // CGM use below 70% flags Low CGM Wear
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeCGMUsePercent = 0.65;
      rerender(ui({ patient }));
      expect(screen.getByText('Low CGM Wear')).toBeInTheDocument();

      // When several thresholds are met, only the highest-priority flag shows
      patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInVeryLowPercent = 0.0134;
      patient.summary.cgmStats.periods['14d'].timeInAnyLowPercent = 0.0568;
      rerender(ui({ patient }));

      expect(screen.getByText('Very Low')).toBeInTheDocument();
      expect(screen.queryByText('Low')).not.toBeInTheDocument();
    });

    it('flags the current category ahead of a higher-priority flag', () => {
      // The summary meets both the Very Low and Low thresholds, which would normally flag Very Low
      let patient = cloneDeep(meetingTargetsPatient);
      patient.summary.cgmStats.periods['14d'].timeInVeryLowPercent = 0.0134;
      patient.summary.cgmStats.periods['14d'].timeInAnyLowPercent = 0.0568;

      renderComponent(<FlagCell patient={patient} category={CATEGORY.ANY_LOW} />);

      // The current dashboard category wins
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.queryByText('Very Low')).not.toBeInTheDocument();
    });
  });

  describe('MoreMenuCell', () => {
    it('dispatches the actions to open the Edit Patient dialog for the patient', async () => {
      renderComponent(<MoreMenuCell patient={patient} />);

      expect(screen.queryByRole('button', { name: /Edit Patient Details/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));

      await userEvent.click(screen.getByRole('button', { name: /Edit Patient Details/ }));

      expect(store.getActions()).toStrictEqual([
        { type: 'tideDashboard/setEditPatientDialogIsOpen', payload: true },
        { type: 'tideDashboard/setEditPatientDialogPatientId', payload: 'patient-1' },
      ]);
    });

    it('dispatches the actions to open the Data Connections modal for the patient', async () => {
      renderComponent(<MoreMenuCell patient={patient} />);

      expect(screen.queryByRole('button', { name: /Bring Data into Tidepool/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));

      await userEvent.click(screen.getByRole('button', { name: /Bring Data into Tidepool/ }));

      expect(store.getActions()).toStrictEqual([
        { type: 'tideDashboard/setDataConnectionsModalIsOpen', payload: true },
        { type: 'tideDashboard/setDataConnectionsModalPatientId', payload: 'patient-1' },
      ]);
    });
  });
});
