import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
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
  MoreMenuCell,
} from '@app/pages/clinicworkspace/TideDashboardV2/Cells';
import { trackMetric as mockTrackMetric } from '../../../../../../app/core/metricUtils';

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
    render(
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <Provider store={store}>{cell}</Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    mockTrackMetric.mockClear();
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { id: 'clinic123', preferredBgUnits: 'mg/dL' } },
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
      renderComponent(<AvgGlucoseCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('149')).toBeInTheDocument(); // averageGlucoseMmol 8.26
    });
  });

  describe('TimeInRangePercentBarChartCell', () => {
    it('renders a bar summary of the time spent in each range', () => {
      renderComponent(<TimeInRangePercentBarChartCell patient={patient} summaryPeriod="14d" />);

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
      renderComponent(<TimeInTargetPercentCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('67 %')).toBeInTheDocument(); // timeInTargetPercent 0.6712
    });
  });

  describe('TimeInVeryLowPercentCell', () => {
    it('renders the time in very low as a whole percentage', () => {
      renderComponent(<TimeInVeryLowPercentCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('1 %')).toBeInTheDocument(); // timeInVeryLowPercent 0.0134
    });
  });

  describe('TimeInAnyLowPercentCell', () => {
    it('renders the time in any low as a whole percentage', () => {
      renderComponent(<TimeInAnyLowPercentCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('6 %')).toBeInTheDocument(); // timeInAnyLowPercent 0.0568
    });
  });

  describe('TimeInVeryHighPercentCell', () => {
    it('renders the time in very high as a whole percentage', () => {
      renderComponent(<TimeInVeryHighPercentCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('7 %')).toBeInTheDocument(); // timeInVeryHighPercent 0.0722
    });
  });

  describe('TimeInAnyHighPercentCell', () => {
    it('renders the time in any high as a whole percentage', () => {
      renderComponent(<TimeInAnyHighPercentCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('27 %')).toBeInTheDocument(); // timeInAnyHighPercent 0.2733
    });
  });

  describe('ChangeTIRCell', () => {
    it('renders the change in time in range as a bar and as a percentage', () => {
      renderComponent(<ChangeTIRCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('15')).toBeInTheDocument(); // compact layout value
    });
  });

  describe('GMICell', () => {
    it('renders the glucose management indicator as a percentage', () => {
      renderComponent(<GMICell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('7.2 %')).toBeInTheDocument();
    });

    it('hides GMI for periods < 14 days', () => {
      const periods = { '1d': { glucoseManagementIndicator: 6.1 }, '7d': { glucoseManagementIndicator: 6.4 }, '30d': { glucoseManagementIndicator: 6.8 } };
      const multiPeriodPatient = { summary: { cgmStats: { periods } } };

      const ui = (props) => <Provider store={store}><GMICell {...props} /></Provider>;

      // 1d & 7d period: hidden
      const { rerender } = render(ui({ patient: multiPeriodPatient, summaryPeriod: '1d' }));
      expect(screen.queryByText('6.1 %')).not.toBeInTheDocument();

      rerender(ui({ patient: multiPeriodPatient, summaryPeriod: '7d' }));
      expect(screen.queryByText('6.4 %')).not.toBeInTheDocument();

      // 30d period: shown
      rerender(ui({ patient: multiPeriodPatient, summaryPeriod: '30d' }));
      expect(screen.getByText('6.8 %')).toBeInTheDocument();
    });
  });

  describe('CGMUseCell', () => {
    it('renders the CGM use as a whole percentage', () => {
      renderComponent(<CGMUseCell patient={patient} summaryPeriod="14d" />);

      expect(screen.getByText('93 %')).toBeInTheDocument(); // timeCGMUsePercent 0.9312
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
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Edit patient', { clinicId: 'clinic123', source: 'action menu', pageName: 'TIDE Dashboard' });
    });

    it('dispatches the actions to open the Data Connections modal for the patient', async () => {
      renderComponent(<MoreMenuCell patient={patient} />);

      expect(screen.queryByRole('button', { name: /Manage Device Connections/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));

      await userEvent.click(screen.getByRole('button', { name: /Manage Device Connections/ }));

      expect(store.getActions()).toStrictEqual([
        { type: 'tideDashboard/setDataConnectionsModalIsOpen', payload: true },
        { type: 'tideDashboard/setDataConnectionsModalPatientId', payload: 'patient-1' },
      ]);
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Edit patient data connections', { clinicId: 'clinic123', source: 'action menu', pageName: 'TIDE Dashboard' });
    });
  });
});
