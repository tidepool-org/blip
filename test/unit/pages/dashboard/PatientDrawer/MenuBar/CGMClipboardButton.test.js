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

import CGMClipboardButton from '../../../../../../app/pages/dashboard/PatientDrawer/MenuBar/CGMClipboardButton';

const expect = chai.expect;

const patient = {
  birthDate: '2001-01-01',
  email: 'tcrawford@test.test',
  fullName: 'Terence Crawford',
  id: '1234-abcd',
};

const pdf = {
  'data': {
    'agpCGM': {
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
      },
    },
  };

const expectedOutput = (
`Terence Crawford
Date of birth: 2001-01-01
Exported from Tidepool TIDE: January 13th, 2025

Reporting Period: December 15, 2024 - January 13, 2025

Avg. Daily Time In Range (mg/dL)
70-180   76%
54-70   3%
<54   0%

Avg. Glucose (CGM): 121 mg/dL
`);

describe('PatientDrawer/MenuBar/CGMClipboardButton', () => {

  const writeTextSpy = sinon.stub(window?.navigator?.clipboard, 'writeText');

  const insufficientPDF = { data: {} };

  describe('When data is not present', () => {
    const wrapper = mount(<CGMClipboardButton patient={patient} pdf={insufficientPDF} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is insufficient due to too few enough readings', () => {
    const insufficientPDF = _.cloneDeep(pdf);
    insufficientPDF.data.agpCGM.data.current.stats.sensorUsage.count = 100;

    const wrapper = mount(<CGMClipboardButton patient={patient} pdf={insufficientPDF} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is insufficient due to being BGM patient', () => {
    const insufficientPDF = _.cloneDeep(pdf);
    insufficientPDF.data.agpCGM.data.current.stats = {
      averageGlucose: { averageGlucose: null, total: 0 },
      bgExtents: { bgMax: null, bgMin: null, bgDaysWorn: 0 },
      coefficientOfVariation: { coefficientOfVariation: null, total: 0, insufficientData: true },
      glucoseManagementIndicator: { glucoseManagementIndicator: null, glucoseManagementIndicatorAGP: null, insufficientData: true },
      sensorUsage: { sensorUsage: 0, sensorUsageAGP: 0, total: 2592000000, sampleFrequency: 300000, count: 0 },
      timeInRange: { 
        durations: { veryLow: null, low: null, target: null, high: null, veryHigh: null, total: 0 },
        counts: { veryLow: 0, low: 0, target: 0, high: 0, veryHigh: 0, total: 0 },
      },
    };

    const wrapper = mount(<CGMClipboardButton patient={patient} pdf={insufficientPDF} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is present', () => {
    const wrapper = mount(<CGMClipboardButton patient={patient} pdf={pdf} />);
    wrapper.find('button').simulate('click');

    it('calls writeText on navigator API with correct data', () => {
      expect(wrapper.find('button').props().disabled).to.be.false;
      expect(writeTextSpy.getCall(0).args[0]).to.eql(expectedOutput);
    });
  });
});
