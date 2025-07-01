/* global expect */
/* global describe */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen, within } from '@testing-library/react';

import PeriodDeltaSummary from '@app/pages/dashboard/PatientDrawer/PeriodDeltaSummary';

const agpCGM = {
  timePrefs: {
    timezoneAware: true,
    timezoneName: 'Etc/GMT+7',
  },
  data: {
    current: {
      stats: {
        averageGlucose: {
          averageGlucose: 7.325994675523737,
          total: 3914,
        },
        bgExtents: {
          bgDaysWorn: 14,
          newestDatum: {
            time: 1750446603111,
            timezoneOffset: -420,
          },
          oldestDatum: {
            time: 1749279783720,
            timezoneOffset: -420,
          },
        },
        coefficientOfVariation: {
          coefficientOfVariation: 32.540647868186156,
          total: 3914,
        },
        glucoseManagementIndicator: {
          glucoseManagementIndicator: 6.467012224680735,
          glucoseManagementIndicatorAGP: 6.467012224680735,
          total: 3914,
        },
        sensorUsage: {
          sensorUsage: 1174200000,
          sensorUsageAGP: 100.60662142710261,
          total: 1209600000,
          sampleInterval: 300000,
          count: 3914,
        },
        timeInRange: {
          durations: {
            veryLow: 750536.5355135411,
            low: 1699744.5068983138,
            target: 72228104.24118549,
            high: 10264690.853346959,
            veryHigh: 1456923.8630556976,
            total: 1174200000,
          },
          counts: {
            veryLow: 34,
            low: 77,
            target: 3272,
            high: 465,
            veryHigh: 66,
            total: 3914,
          },
        },
      },
    },
  },
};

const offsetAgpCGM = {
  timePrefs: {
    timezoneAware: true,
    timezoneName: 'Etc/GMT+7',
  },
  data: {
    current: {
      stats: {
        averageGlucose: {
          averageGlucose: 7.460624420125762,
          total: 3975,
        },
        bgExtents: {
          bgDaysWorn: 14,
          newestDatum: {
            time: 1749279483453,
            timezoneOffset: -420,
          },
          oldestDatum: {
            time: 1748070291821,
            timezoneOffset: -420,
          },
        },
        coefficientOfVariation: {
          coefficientOfVariation: 37.78298661066899,
          total: 3975,
        },
        glucoseManagementIndicator: {
          glucoseManagementIndicator: 6.525028612671605,
          glucoseManagementIndicatorAGP: 6.525028612671605,
          total: 3975,
        },
        sensorUsage: {
          sensorUsage: 1192500000,
          sensorUsageAGP: 98.21119996031549,
          total: 1209600000,
          sampleInterval: 300000,
          count: 3975,
        },
        timeInRange: {
          durations: {
            veryLow: 782490.5660377359,
            low: 2543094.3396226414,
            target: 67555018.86792453,
            high: 12780679.245283019,
            veryHigh: 2738716.981132075,
            total: 1192500000,
          },
          counts: {
            veryLow: 36,
            low: 117,
            target: 3108,
            high: 588,
            veryHigh: 126,
            total: 3975,
          },
        },
      },
    },
  },
};

describe('PatientDrawer/PeriodDeltaSummary', () => {
  describe('When data is not present', () => {
    it('renders nothing', () => {
      const { container } = render(<PeriodDeltaSummary agpCGM={undefined} offsetAgpCGM={undefined} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('When data for previous period is not present', () => {
    it('renders a message for insufficient data', () => {
      render(<PeriodDeltaSummary agpCGM={agpCGM} offsetAgpCGM={undefined} />);

      expect(screen.getByText('Insufficient data to calculate Time in Ranges')).toBeInTheDocument();

      expect(screen.queryByTestId('period-delta-summary-time-in-very-low')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-delta-summary-time-in-low')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-delta-summary-time-in-target')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-delta-summary-time-in-high')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-delta-summary-time-in-very')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-delta-summary-time-cgm-active')).not.toBeInTheDocument();
    });
  });

  describe('When data is present', () => {
    it('renders the data in the expected format', () => {
      render(<PeriodDeltaSummary agpCGM={agpCGM} offsetAgpCGM={offsetAgpCGM} />);

      const veryLowContainer = screen.queryByTestId('period-delta-summary-time-in-very-low');
      const lowContainer = screen.queryByTestId('period-delta-summary-time-in-low');
      const targetContainer = screen.queryByTestId('period-delta-summary-time-in-target');
      const highContainer = screen.queryByTestId('period-delta-summary-time-in-high');
      const veryHighContainer = screen.queryByTestId('period-delta-summary-time-in-very-high');
      const cgmActiveContainer = screen.queryByTestId('period-delta-summary-time-cgm-active');

      expect(veryLowContainer).toBeInTheDocument();
      expect(within(veryLowContainer).getByText('Did not change')).toBeInTheDocument();
      expect(within(veryLowContainer).getByText('Was 1%')).toBeInTheDocument();

      expect(lowContainer).toBeInTheDocument();
      expect(within(lowContainer).getByText('Decreased by 1%')).toBeInTheDocument();
      expect(within(lowContainer).getByText('Was 3%')).toBeInTheDocument();

      expect(targetContainer).toBeInTheDocument();
      expect(within(targetContainer).getByText('Increased by 6%')).toBeInTheDocument();
      expect(within(targetContainer).getByText('Was 78%')).toBeInTheDocument();

      expect(highContainer).toBeInTheDocument();
      expect(within(highContainer).getByText('Decreased by 3%')).toBeInTheDocument();
      expect(within(highContainer).getByText('Was 15%')).toBeInTheDocument();

      expect(veryHighContainer).toBeInTheDocument();
      expect(within(veryHighContainer).getByText('Decreased by 1%')).toBeInTheDocument();
      expect(within(veryHighContainer).getByText('Was 3%')).toBeInTheDocument();

      expect(cgmActiveContainer).toBeInTheDocument();
      expect(within(cgmActiveContainer).getByText('Increased by 2.4%')).toBeInTheDocument();
      expect(within(cgmActiveContainer).getByText('Was 98.2%')).toBeInTheDocument();
    });
  });
});
