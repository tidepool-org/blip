/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import CGMStatistics from '../../../../../app/pages/dashboard/PatientDrawer/CGMStatistics';

const expect = chai.expect;

const agpCGM = {
  'data': {
    'current': {
      'aggregationsByDate': {},
      'stats': {
        'averageGlucose': {
          'averageGlucose': 121.24147339699863,
          'total': 733
        },
        'bgExtents': {
          'bgMax': 350,
          'bgMin': 39,
          'bgDaysWorn': 7,
          'newestDatum': { 'time': 1733164212000 },
          'oldestDatum': { 'time': 1732608015000 }
        },
        'coefficientOfVariation': {
          'coefficientOfVariation': 49.838071869255685,
          'total': 733
        },
        'glucoseManagementIndicator': {
          'glucoseManagementIndicator': null,
          'glucoseManagementIndicatorAGP': 6.210096043656208,
          'insufficientData': true
        },
        'sensorUsage': {
          'sensorUsage': 219900000,
          'sensorUsageAGP': 39.514824797843666,
          'total': 604800000,
          'sampleFrequency': 300000,
          'count': 733
        },
        'timeInRange': {
          'durations': {
            'veryLow': 5186357.435197817,
            'low': 12376534.788540244,
            'target': 56106957.70804911,
            'high': 8368894.952251023,
            'veryHigh': 4361255.115961801,
            'total': 219900000
          },
          'counts': {
            'veryLow': 44,
            'low': 105,
            'target': 476,
            'high': 71,
            'veryHigh': 37,
            'total': 733
          }
        }
      },
      'endpoints': {
        'range': [
          1732608000000,
          1733212800000
        ],
        'days': 7,
        'activeDays': 7
      }
    }
  },
  'timePrefs': {
    'timezoneAware': true,
    'timezoneName': 'US/Eastern'
  },
  'bgPrefs': {
    'bgUnits': 'mg/dL'
  },
  'query': {},
  'metaData': {}
}

describe('PatientDrawer/CGMStatistics', () => {
  describe('When data is not present', () => {
    const wrapper = mount(<CGMStatistics agpCGM={undefined} />);

    it('renders no data', () => {
      expect(wrapper.isEmptyRender()).to.be.true;
    })
  });

  describe('When data is in mg/dL', () => {
    const wrapper = mount(<CGMStatistics agpCGM={agpCGM} />);

    it('renders the time range in the expected format', () => {
      expect(wrapper.find('#agp-table-time-range').hostNodes().text()).to.include('November 26 - December 2, 2024 (7 days)');
    })

    it('renders the CGM Active % in the expected format', () => {
      expect(wrapper.find('#agp-table-cgm-active').hostNodes().text()).to.include('39.5%');
    })

    it('renders the Average Glucose in the expected format', () => {
      expect(wrapper.find('#agp-table-avg-glucose').hostNodes().text()).to.include('121 mg/dL');
    })

    it('renders the GMI in the expected format', () => {
      expect(wrapper.find('#agp-table-gmi').hostNodes().text()).to.include('6.2%');
    })

    it('renders the Glucose Variability in the expected format', () => {
      expect(wrapper.find('#agp-table-cov').hostNodes().text()).to.include('49.8%');
    })
  });
});
