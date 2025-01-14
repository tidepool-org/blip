/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';

import CGMStatistics from '../../../../../../app/pages/dashboard/PatientDrawer/CGMStatistics';

const expect = chai.expect;

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
          'sensorUsageAGP': 99.95264030310206,
          'total': 2592000000,
          'sampleFrequency': 300000,
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
    const wrapper = mount(<CGMStatistics agpCGM={undefined} />);

    it('renders no data', () => {
      expect(wrapper.isEmptyRender()).to.be.true;
    });
  });

  describe('When data is in mg/dL', () => {
    const wrapper = mount(<CGMStatistics agpCGM={agpCGM} />);

    it('renders the time range in the expected format', () => {
      expect(wrapper.find('#agp-table-time-range').hostNodes().text()).to.include('December 15, 2024 - January 13, 2025 (30 days)');
    });

    it('renders the CGM Active % in the expected format', () => {
      expect(wrapper.find('#agp-table-cgm-active').hostNodes().text()).to.include('100%');
    });

    it('renders the Average Glucose in the expected format', () => {
      expect(wrapper.find('#agp-table-avg-glucose').hostNodes().text()).to.include('121 mg/dL');
    });

    it('renders the GMI in the expected format', () => {
      expect(wrapper.find('#agp-table-gmi').hostNodes().text()).to.include('6.2%');
    });

    it('renders the Glucose Variability in the expected format', () => {
      expect(wrapper.find('#agp-table-cov').hostNodes().text()).to.include('49.8%');
    });
  });
});
