/* global expect */
/* global describe */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen } from '@testing-library/react';

import CGMStatistics from '@app/pages/dashboard/PatientDrawer/CGMStatistics';

const agpCGM = {
  'data': {
    'current': {
      'aggregationsByDate': {},
      'stats': {
        'averageGlucose': {
          'averageGlucose': 121.4013071783735,
          'total': 8442,
        },
        'bgExtents': {
          'bgMax': 401.00001001500004,
          'bgMin': 38.9999690761,
          'bgDaysWorn': 30,
          'newestDatum': { 'time': 1736783190269 },
          'oldestDatum': { 'time': 1734249705225 },
        },
        'coefficientOfVariation': {
          'coefficientOfVariation': 49.82047988955789,
          'total': 8442,
        },
        'glucoseManagementIndicator': {
          'glucoseManagementIndicator': 6.236871267706695,
          'glucoseManagementIndicatorAGP': 6.236871267706695,
          'total': 8442,
        },
        'sensorUsage': {
          'sensorUsage': 2532600000,
          'sensorUsageAGP': 99.9426403,
          'total': 2592000000,
          'sampleInterval': 300000,
          'count': 8442,
        },
        'timeInRange': {
          'durations': {
            'veryLow': 337739.8720682303,
            'low': 2507462.686567164,
            'target': 66023027.7185501,
            'high': 14031556.503198294,
            'veryHigh': 3500213.219616205,
            'total': 2532600000,
          },
          'counts': {
            'veryLow': 33,
            'low': 245,
            'target': 6451,
            'high': 1371,
            'veryHigh': 342,
            'total': 8442,
          },
        },
      },
      'endpoints': {
        'range': [1734249600000, 1736841600000 ],
        'days': 30,
        'activeDays': 30,
      },
      'data': {},
    },
  },
  'timePrefs': { 'timezoneAware': true, 'timezoneName': 'Etc/GMT+8' },
  'bgPrefs': {
    'bgBounds': {
      'veryHighThreshold': 250,
      'targetUpperBound': 180,
      'targetLowerBound': 70,
      'veryLowThreshold': 54,
      'extremeHighThreshold': 350,
      'clampThreshold': 600,
    },
    'bgClasses': {
      'low': { 'boundary': 70 },
      'target': { 'boundary': 180 },
      'very-low': { 'boundary': 54 },
      'high': { 'boundary': 250 },
    },
    'bgUnits': 'mg/dL',
  },
  'query': {
    'endpoints': [
      1734249600000,
      1736841600000,
    ],
    'aggregationsByDate': 'dataByDate, statsByDate',
    'bgSource': 'cbg',
    'stats': [
      'averageGlucose',
      'bgExtents',
      'coefficientOfVariation',
      'glucoseManagementIndicator',
      'sensorUsage',
      'timeInRange',
    ],
    'types': { 'cbg': {} },
    'bgPrefs': {
      'bgUnits': 'mg/dL',
      'bgClasses': {
        'low': { 'boundary': 70 },
        'target': { 'boundary': 180 },
        'very-low': { 'boundary': 54 },
        'high': { 'boundary': 250 },
      },
      'bgBounds': {
        'veryHighThreshold': 250,
        'targetUpperBound': 180,
        'targetLowerBound': 70,
        'veryLowThreshold': 54,
        'extremeHighThreshold': 350,
        'clampThreshold': 600,
      },
    },
    'metaData': 'latestPumpUpload, bgSources',
    'timePrefs': {
      'timezoneAware': true,
      'timezoneName': 'Etc/GMT+8',
    },
    'excludedDevices': [],
  },
  'metaData': {},
};

describe('PatientDrawer/CGMStatistics', () => {
  describe('When data is not present', () => {
    it('renders nothing', () => {
      const { container } = render(<CGMStatistics agpCGM={undefined} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('When data is in mg/dL', () => {
    it('renders the data in the expected format', () => {
      render(<CGMStatistics agpCGM={agpCGM} />);

      expect(screen.getByTestId('agp-table-time-range')).toHaveTextContent('Time RangeDecember 15, 2024 - January 13, 2025 (30 days)');
      expect(screen.getByTestId('agp-table-cgm-active')).toHaveTextContent('Time CGM Active99.9%');
      expect(screen.getByTestId('agp-table-avg-glucose')).toHaveTextContent('Average Glucose(Goal <154 mg/dL)121 mg/dL');
      expect(screen.getByTestId('agp-table-gmi')).toHaveTextContent('Glucose Management Indicator(Goal <7%)6.2%');
      expect(screen.getByTestId('agp-table-cov')).toHaveTextContent('Glucose Variability(Defined as a percent coefficient of variation. Goal <= 36%)49.8%');
    });
  });
});
